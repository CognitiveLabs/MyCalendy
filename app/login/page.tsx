import { login, signup } from "./actions";
import Header from "../header/page";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Log in Page</h1>
        <p className={styles.paragraph}>
          Currently we are in test phase, so signups are limited to a select
          few. If you&apos;d like to test this app out early, please reach out
          to us on Twitter at{" "}
          <a
            href="https://twitter.com/MyCalendy"
            target="_blank"
            rel="noopener noreferrer"
          >
            @MyCalendy
          </a>
          .
        </p>
        <form className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={styles.input}
          />
          <label htmlFor="password" className={styles.label}>
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={styles.input}
          />
          <button formAction={login} className={styles.button}>
            Log in
          </button>
          <button formAction={signup} className={styles.button}>
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
