// BlogPost.tsx

import React from "react";

const BlogPost: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl signika-header font-extrabold sm:text-left mb-3">
        Pesonal Scheduling Based on Cognitive Science
      </h2>

      {/* Introduction */}
      <p className="text-lg mb-6 " style={{ textIndent: "2em" }}>
        My Calendy is a scheduling tool that aims to help users organize their
        tasks based on their cognitive rhythms. By considering factors such as
        time of day, individual chronotypes, and sleep patterns, My Calendy
        attempts to create schedules that align with users' cognitive strengths
        throughout the day.
      </p>

      {/* Understanding Cognitive Rhythms */}
      <h2 className="text-2xl signika-header font-extrabold sm:text-left mb-3">
        The Basis in Cognitive Science
      </h2>
      <p className=" mb-6" style={{ textIndent: "2em" }}>
        Recent research has shown that cognitive performance can vary throughout
        the day. A study by Tommasi et al. (2024) found that productivity
        fluctuates based on the type of cognitive task and an individual's
        biological rhythm<span className="footnote">[1]</span>. My Calendy uses
        these insights to suggest optimal times for different types of tasks.
      </p>
      <p className=" mb-6" style={{ textIndent: "2em" }}>
        For example, the app might suggest scheduling analytical tasks during
        times when a user's cognitive abilities in that area are likely to be at
        their peak, based on their personal profile and the time of day.
      </p>

      <h2 className="text-2xl signika-header font-extrabold sm:text-left mb-3">
        Considering Individual Chronotypes
      </h2>
      <p style={{ textIndent: "2em" }}>
        Chronotypes refer to individual differences in sleep-wake cycles and
        preferences for morning or evening activity. My Calendy takes these
        differences into account when creating schedules. The app doesn't assume
        that everyone performs best in the morning or evening, but instead tries
        to adapt to each user's unique patterns.
      </p>
      <br />
      <p className="mb-6" style={{ textIndent: "2em" }}>
        Research indicates that chronotypes can influence the timing of peak
        cognitive performance. My Calendy uses this information to suggest task
        timings that may be more suitable for each user
        <span className="footnote">[2]</span>.
      </p>

      <h2 className="text-2xl signika-header font-extrabold sm:text-left mb-3">
        Adapting to Changing Factors
      </h2>
      <p style={{ textIndent: "2em" }}>
        My Calendy attempts to adjust its scheduling suggestions based on
        various factors that can affect cognitive performance. These include
        recent sleep history, seasonal changes, and past task performance. The
        goal is to provide scheduling suggestions that remain relevant even as a
        user's circumstances change.
      </p>
      <br />
      <p className="mb-6" style={{ textIndent: "2em" }}>
        This approach is based on research showing that cognitive performance
        can be influenced by various external and internal factors
        <span className="footnote">[3]</span>.
      </p>

      {/* Conclusion */}
      <h2 className="text-2xl signika-header font-extrabold sm:text-left mb-3">
        A Tool for Personal Productivity
      </h2>
      <p className="mb-6" style={{ textIndent: "2em" }}>
        My Calendy aims to be a helpful tool for personal productivity. By
        applying findings from cognitive science, the app tries to provide users
        with schedules that take into account their individual cognitive
        patterns and preferences.
      </p>
      <p style={{ textIndent: "2em" }}>
        Whether you're working on analytical tasks, creative projects, or
        administrative duties, My Calendy attempts to suggest times when you
        might be more cognitively prepared for each type of work. While
        individual results may vary, the app's goal is to provide a scheduling
        approach informed by current scientific understanding of cognitive
        rhythms.
      </p>
    </div>
  );
};

export default BlogPost;
