import Header from "../header/page";
import LogoCloud from "@/components/LogoCloud";

export default function AboutPage() {
  return (
    <div>
      <Header />
      <div
        className="App justify-center items-center"
        style={{ maxWidth: "800px", width: "90%", margin: "30px auto" }}
      >
        <h3 className="text-4xl signika-header font-extrabold sm:text-center sm:text-6xl">
          About My Calendy
        </h3>
        <br />
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Our journey began with a simple goal - to maximize our own schedules.
          We knew that every day regardless of the amount of work we
          accomplished or not, we were still leaving efficient and productive
          work &quot;on the table.&quot; We wanted a way to capture as much of
          our brains ability each day with each task, instead of hoping we could
          capture it as we later started each task. With a little research we
          learned that you can improve your schedule by organizing tasks based
          on your cognitive abilities.
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          We wanted to be able to organize our tasks not just when we were
          putting them in our calendar, but also tasks that were already in our
          calendar. We wanted our schedules to adjust in real time as our
          schedules fluctuated, whether it was within our control or not. For
          example, say you missed a meeting and now your schedule is off, we
          want to re-optimize our schedules based on our individual cognitive
          abilities and the new changes in our schdule, but without having to do
          it manually.
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          So what started out as a personal side-project to be able to maximize
          our schedules has now turned into a product that we want to share with
          others. And thanks to the technology stack that we are built on, we
          are able to do just that.
        </p>
        <LogoCloud />
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Langchain is a language translation API that allows us to translate
          your input as you chat with My Calendy about your schedule.{" "}
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Supabase is a vector database that allows us to store our cognitive
          research data in a way that fits how cognivite ability data needs to
          be stored. No two people are the same, so no two people should have
          the same spreadsheet or calendar applied to you. Everyones uniqueness
          is what drives the need for a vector database so using{" "}
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Google is used to authenticate each user and to allow you to connect
          your calendar allowing you to create events on your calendar directly
          from My Calendy.
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Stripe is used to handle all of our payments and subscriptions. One
          thing that we like most is that users handle their own payment and
          profile dricetly through Stripe, so we dont store or ever handle any
          of your payment information.
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Github is where all of the code for My Calendy is stored. It means we
          can transparently show you all of the code and all of the updates as
          we make them.
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Nextjs is the framework that we use to build My Calendy. It allows us
          to create fast and simple web applications that are easy to maintain
          and update.
        </p>
        <p className="signikaAbout text-lg mb-6" style={{ textIndent: "2em" }}>
          Vercel is the platform that we use to deploy My Calendy. It allows us
          to deploy our applications with ease and speed, especially with every
          single update that we make to My Calendy. There is no need to redploy
          or redirect any traffic, it just works. seemlessy with every update we
          make to our code in Github.
        </p>
      </div>
    </div>
  );
}
