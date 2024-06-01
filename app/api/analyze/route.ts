import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

export const runtime = "edge";

let documents: Document[] = [];
let resolveWithDocuments: (value: Document[]) => void;
const documentPromise = new Promise<Document[]>((resolve) => {
  resolveWithDocuments = resolve;
});

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE,
);

const ANSWER_TEMPLATE = `You are an expert personal productivity assistant in the field of cognitive abilities and task scheduling. Your role is to provide clear and concise answers about when and how to schedule tasks based on cognitive abilities.

Break down the task described and provide specific time slots (15, 30, or 45 minutes) for each part. Ensure the total time does not exceed the user's specified maximum hours. Provide the time slots in the format of "08:00", "08:15", "08:30", etc. Additionally, provide a short description for each time slot, explaining what should be done in that slot.

Take into consideration the user's cognitive abilities throughout the day, and schedule tasks accordingly. Refer to the following context for information on cognitive abilities:
<context>
  {context}
</context>

Here are the cognitive abilities that My Calendy is using in the database:

Cognitive Abilities
- Analytical: Break down complex information, find patterns, and draw logical conclusions.
- Perceptual: Process and interpret details, patterns, and information.
- Creative: Generate ideas and solutions in an unstructured, free-flowing manner.
- Conceptual: Create concepts and form innovative connections between ideas.
- Strategic: Pivoting to use your same resources in new and beneficial ways.
- Administrative: Efficiently organize and manage tasks, resources, and people.
- Technical: Apply specialized knowledge and skills to solve practical problems.
- Collaborative: Work cooperatively with others to achieve shared objectives.

Examples:
- Analytical: Puzzles, data analysis, code review for sharp mornings (peak focus).
- Perceptual: Proofreading, image editing, design in high-acuity afternoons.
- Creative: Brainstorming, writing sessions during relaxed moments (free thinking).
- Conceptual: Quiet, distraction-free periods for strategic planning & reports.
- Strategic: Long-term goals, budgeting in clear mornings (future focus).
- Administrative: Emails, filing, data entry for lower energy, focused times.
- Technical: Coding, troubleshooting during peak energy & focus periods.
- Collaborative: Meetings, projects when energy & communication are high.

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;

const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

interface Message {
  role: string;
  id: number;
  content: string;
}

interface Input {
  question: string;
  chat_history: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages ?? [];

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      temperature: 0.2,
    });

    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!,
    );
    const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);

    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments(documents);
    });

    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(docs) {
            resolveWithDocuments(docs);
          },
        },
      ],
    });

    const retrievalChain = retriever.pipe(combineDocumentsFn);

    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input: Input) => input.question,
          retrievalChain,
        ]),
        chat_history: (input: Input) => input.chat_history,
        question: (input: Input) => input.question,
      },
      answerPrompt,
      model,
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: (input: Input) => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    const results = await Promise.all(
      messages.map(async (message: Message) => {
        const question = message.content;

        const stream = await conversationalRetrievalQAChain.stream({
          question,
          chat_history: "",
        });

        let bestTime = "";
        for await (const chunk of stream) {
          bestTime += new TextDecoder().decode(chunk);
        }

        // Extract specific times and descriptions from the response
        const steps = bestTime
          .split("\n")
          .filter((step) => step.trim() !== "")
          .map((step) => {
            const [time, ...descriptionParts] = step.split(": ");
            const description = descriptionParts.join(": ").trim();
            return {
              time: time.trim(),
              description,
            };
          });

        const cognitiveOrder = [
          "Administrative",
          "Analytical",
          "Technical",
          "Perceptual",
          "Collaborative",
          "Creative",
          "Conceptual",
          "Strategic",
        ];

        // Ensure this part orders steps correctly based on the cognitive order
        const orderedSteps = steps.sort((a, b) => {
          const aIndex = cognitiveOrder.findIndex((c) =>
            a.description.includes(c),
          );
          const bIndex = cognitiveOrder.findIndex((c) =>
            b.description.includes(c),
          );
          return aIndex - bIndex;
        });

        return { id: message.id, steps: orderedSteps };
      }),
    );

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
