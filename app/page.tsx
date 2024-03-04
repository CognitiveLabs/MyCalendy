import { ChatWindow } from "@/components/ChatWindow";
import Columns from "@/components/Columns";
import Footer from "./footer/Footer";
import Header from "./header/page";

export default async function Homepage() {
  const InfoCard = (
    <div
      className="rounded w-full max-h-[85%] overflow-hidden"
      style={{
        padding: "0 auto",
        borderRadius: "15px",
      }}
    >
      <h1 className="signika-header text-center font-extrabold sm:text-4xl">
        <span style={{ color: "#48bb78" }}>Try</span> My Calendy
      </h1>

      <p className="signika text-center ">
        My Calendy is your personal productivity assistant capable of making the
        most of your time. Test it out with a question like:
      </p>
      <div className="signika text-center">
        <p className="font-extrabold smalltext ">
          &quot;Of these four tasks that I can do over the next 45 minutes on my
          morning train commute, which one would I be the most efficient
          in?&quot;
        </p>
        <p className=" smalltext">
          Once you signup and connect your google calendar, you&apos;ll be able
          to ask questions like:
        </p>
        <p className="font-extrabold smalltext">
          &quot;When is the best time to write that futuristic sci-fi I have
          always wanted to according to my schedule?&quot;
        </p>
        <p className="font-extrabold smalltext">
          &quot;If I didn&apos;t get much sleep last night, how can I adjust my
          schedule to not lose any productivity?&quot;
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <Header />
      <div
        className="App justify-center items-center"
        style={{ maxWidth: "800px", width: "90%", margin: "30px auto" }}
      >
        <h1 className="signika-header font-extrabold pb-5 sm:text-6xl md:text-6xl text-center mobiletext">
          My Calendy
        </h1>

        <h2 className="signika-title font-extrabold pb-5 sm:text-4xl md:text-4xl text-center mobiletext">
          the Cognitive Calendar
        </h2>

        <p className="signika text-center">
          My Calendy is designed around <b>you</b> to organize your tasks and
          activities based on your <b>cognitive abilities</b>, enhancing your{" "}
          <b>efficiency</b> and <b>productivity</b>.
        </p>
        <p className="signika text-center pt-5">
          My Calendy doesn&apos;t just tell you <b>when</b> to do something, it
          tells you <b>what</b> to do <b>when</b>. By understanding your
          fluctuating cognitive <b>abilities</b>, it aligns your tasks{" "}
          <b>accordingly</b>. Need <b>analytical thinking</b>? My Calendy
          schedules that for when your brain is <b>sharpest</b>.
          <b> Creative writing</b>? It plans that for when your{" "}
          <b>imagination</b> is <b>soaring</b>. It&apos;s like having a
          <b>personal productivity coach</b> whispering in your ear, guiding you
          towards
          <b>peak performance</b> hour by hour.
        </p>
      </div>
      <Columns />
      <div
        className="App justify-center items-center"
        style={{ maxWidth: "800px", width: "90%", margin: "50px auto" }}
      >
        <div
          className="mb-8"
          style={{
            padding: "0 10px",
            borderRadius: "15px",
            boxShadow: "0px 0px 30px #38b6ff",
          }}
        >
          <ChatWindow
            endpoint="api/chat/retrieval"
            emoji="🙋‍♀️"
            titleText="Cally, your personal productivity assistant"
            placeholder="Ask away!"
            emptyStateComponent={InfoCard}
          ></ChatWindow>
          <br />
        </div>
      </div>

      <Footer />
    </div>
  );
}
