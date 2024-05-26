"use client";

import React, { useState } from "react";
import styles from "./EventList.module.css";
import { EventRow } from "./EventList";
import { createClient } from "@/utils/supabase/client";

interface ProjectsProps {
  events: EventRow[];
}

const supabase = createClient();

const parseBestTime = (bestTime: string): string[] => {
  if (!bestTime) return [];
  // Split the bestTime string by periods to extract steps and summarize each step
  return bestTime
    .split(".")
    .filter((step) => step.trim() !== "")
    .map((step) => summarizeStep(step));
};

const summarizeStep = (step: string): string => {
  const words = step.trim().split(" ");
  return words.slice(0, 5).join(" ");
};

const saveProjectToSupabase = async (project: {
  description: string;
  steps: string[];
}) => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    console.error("Error fetching session:", sessionError);
    return;
  }

  const user = sessionData.session.user;

  const { data, error } = await supabase.from("projects").insert([
    {
      user_id: user.id,
      description: project.description,
      steps: JSON.stringify(
        project.steps.map((step, index) => ({
          step_order: index + 1,
          description: step,
          completed: false,
        })),
      ),
    },
  ]);

  if (error) {
    console.error("Error inserting project:", error);
  } else {
    console.log("Project inserted:", data);
  }
};

const updateStepCompletion = async (
  projectId: string,
  stepOrder: number,
  completed: boolean,
) => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    console.error("Error fetching session:", sessionError);
    return;
  }

  const user = sessionData.session.user;

  // Fetch the current project data
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("steps")
    .eq("user_id", user.id)
    .eq("id", projectId)
    .single();

  if (projectError) {
    console.error("Error fetching project:", projectError);
    return;
  }

  const steps = projectData.steps;

  // Update the specific step's completed status
  if (steps[stepOrder - 1]) {
    steps[stepOrder - 1].completed = completed;
  }

  // Update the project with the new steps
  const { error: updateError } = await supabase
    .from("projects")
    .update({ steps })
    .eq("user_id", user.id)
    .eq("id", projectId);

  if (updateError) {
    console.error("Error updating step:", updateError);
  } else {
    console.log("Step updated successfully");
  }
};

const ProgressBar: React.FC<{ steps: string[]; projectId: string }> = ({
  steps,
  projectId,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStepCompletion = async (index: number) => {
    const isCompleted = completedSteps.includes(index);
    const newCompletedSteps = isCompleted
      ? completedSteps.filter((stepIndex) => stepIndex !== index)
      : [...completedSteps, index];

    setCompletedSteps(newCompletedSteps);

    // Update the specific step in Supabase
    await updateStepCompletion(projectId, index + 1, !isCompleted);
  };

  return (
    <div className={styles["progress-bar"]}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles["progress-step"]} ${
            completedSteps.includes(index)
              ? styles["completed"]
              : styles["incomplete"]
          }`}
          onClick={() => toggleStepCompletion(index)}
        >
          {step.trim()}
        </div>
      ))}
    </div>
  );
};

const Projects: React.FC<ProjectsProps> = ({ events }) => {
  const handleSaveProjects = async () => {
    for (const event of events) {
      const steps = parseBestTime(event.bestTime || "");
      await saveProjectToSupabase({
        description: event.description,
        steps: steps,
      });
    }
  };

  return (
    <div className={styles["event-list"]}>
      <h2>Project List</h2>
      <button onClick={handleSaveProjects}>Save Projects to Database</button>
      {events.map((event) => {
        const steps = parseBestTime(event.bestTime || "");
        return (
          <div key={event.id} className={styles["event-row"]}>
            <span className={styles["event-number"]}>{event.id}</span>
            <div className={styles["event-description"]}>
              {event.description}
            </div>
            {steps.length > 0 && (
              <ProgressBar steps={steps} projectId={event.id.toString()} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Projects;
