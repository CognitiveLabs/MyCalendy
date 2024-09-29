"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./EarlySignupPage.module.css";

const supabase = createClientComponentClient();

const EarlySignupPage = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const { data, error } = await supabase.rpc("are_early_signups_available");
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) throw signInError;

      // The user will be redirected to Google for authentication
      // After successful authentication, they'll be redirected back to your app
      // The callback route will handle inserting the user into the early_signups table
    } catch (error) {
      console.error("Error during sign up process:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Calendy Early Access</h1>
      <p className={styles.subtitle}>
        Align your tasks with your natural rhythms
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What is My Calendy?</h2>
        <p className={styles.text}>
          My Calendy is a scheduling tool that helps you organize tasks based on
          your personal energy levels and cognitive patterns. It considers:
        </p>
        <ul className={styles.list}>
          <li>Your preferred work times</li>
          <li>Daily energy fluctuations</li>
          <li>Task types (creative, analytical, administrative)</li>
        </ul>
        <p className={styles.text}>
          Our goal is to suggest schedules that align with your most effective
          work periods.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Choose My Calendy?</h2>
        <div className={styles.reasons}>
          <div>
            <h3>Reduce Decision Fatigue</h3>
            <p>Let My Calendy suggest what to work on and when</p>
          </div>
          <div>
            <h3>Optimize Productivity</h3>
            <p>Make better use of your high-energy hours</p>
          </div>
          <div>
            <h3>Balance Your Workload</h3>
            <p>Distribute tasks according to your natural rhythms</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Early Access Benefits</h2>
        <div className={styles.benefits}>
          <div>
            <span className={styles.benefitHighlight}>6 months</span>
            <p>Free access after launch</p>
          </div>
          <div>
            <span className={styles.benefitHighlight}>Direct feedback</span>
            <p>Shape the product&apos;s development</p>
          </div>
          <div>
            <span className={styles.benefitHighlight}>50% off</span>
            <p>First year subscription</p>
          </div>
        </div>
        <p className={styles.priceInfo}>
          Regular price: $5/month. Early access limited to 500 users.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Privacy & Security</h2>
        <p className={styles.text}>
          We use Google Authentication for secure, hassle-free sign-ups:
        </p>
        <ul className={styles.list}>
          <li>Sign in with your Google account</li>
          <li>We don&apos;t store passwords</li>
          <li>Minimal data collection</li>
        </ul>
        <p className={styles.text}>
          Your privacy is our priority. We&apos;re committed to data protection
          and transparency.
        </p>
      </section>
      {isAvailable ? (
        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className={styles.signupButton}
        >
          {isLoading ? "Signing Up..." : "Join Early Access with Google"}
        </button>
      ) : (
        <p className={styles.errorMessage}>
          We&apos;re sorry, but all early access spots have been filled. Please
          check back later for our public launch!
        </p>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </footer>
    </div>
  );
};

export default EarlySignupPage;
