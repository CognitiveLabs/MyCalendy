"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import styles from "./MorningFinal.module.css";

interface MorningSliderProps {
  morningvalue: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const MorningSlider: React.FC<MorningSliderProps> = ({
  morningvalue,
  onChange,
}) => {
  const shouldShift = morningvalue > -1 && morningvalue < 101;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--morning-value",
      morningvalue.toString(),
    );
  }, [morningvalue]);

  return (
    <div className={styles.morningSliderContainer}>
      <div className={styles.morningControl}>
        <input
          id="track"
          type="range"
          min="0"
          max="100"
          value={morningvalue}
          onChange={onChange}
          className={styles.morningSliderInput}
        />
        <div
          className={styles.morningTooltip}
          style={{ "--shift": shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
        <div
          className={styles.morningControlTrack}
          style={{ "--shift": shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
      </div>
    </div>
  );
};

const MorningForm: React.FC = () => {
  const [morningSliderValue, setMorningSliderValue] = useState<number>(50);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const morningvalue = parseInt(event.target.value, 10);
    setMorningSliderValue(morningvalue);
    document.documentElement.style.setProperty(
      "--morning-value",
      morningvalue.toString(),
    );
  };

  return (
    <div>
      <h2 className="text-center">Morning or evening person?</h2>
      <br />
      <form>
        <MorningSlider
          morningvalue={morningSliderValue}
          onChange={handleSliderChange}
        />
        <br />
        <br />
      </form>
    </div>
  );
};

export { MorningSlider };

export default MorningForm;
