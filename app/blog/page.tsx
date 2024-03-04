import BlogPost from "./post1";
import Header from "../header/page";

export default function Blog() {
  return (
    <div>
      <Header />
      <div
        style={{ maxWidth: "800px", width: "90%", margin: "30px auto" }}
        className="App justify-center items-center"
      >
        <header>
          <h1 className="text-4xl signika-header font-extrabold sm:text-center sm:text-6xl">
            My Calendy Blog
          </h1>
          <br />
        </header>

        <p className="text-2xl signika-orange text-orange-500 font-extrabold sm:text-center">
          Our first blog post
        </p>
        <br />
        <BlogPost />
      </div>
    </div>
  );
}
