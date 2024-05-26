"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import styles from "./EnergyFinal.module.css";

interface EnergySliderProps {
  energyvalue: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const EnergySlider: React.FC<EnergySliderProps> = ({
  energyvalue,
  onChange,
}) => {
  const shouldShift = energyvalue > -1 && energyvalue < 101;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--energy-value",
      energyvalue.toString(),
    );
  }, [energyvalue]);

  return (
    <div className={styles.energySliderContainer}>
      <div className={styles.energyControl}>
        <input
          id="track"
          type="range"
          min="0"
          max="100"
          value={energyvalue}
          onChange={onChange}
          className={styles.energySliderInput}
        />
        <div
          className={styles.energyTooltip}
          style={{ "--shift": shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
        <div
          className={styles.energyControlTrack}
          style={{ "--shift": shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
      </div>
    </div>
  );
};

const EnergyForm: React.FC = () => {
  const [energySliderValue, setEnergySliderValue] = useState<number>(50);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const energyvalue = parseInt(event.target.value, 10);
    setEnergySliderValue(energyvalue);
    document.documentElement.style.setProperty(
      "--energy-value",
      energyvalue.toString(),
    );
  };

  return (
    <div>
      <h2 className="text-center">How energized are you today?</h2>
      <br />
      <form>
        <EnergySlider
          energyvalue={energySliderValue}
          onChange={handleSliderChange}
        />
        <br />
        <br />
      </form>
    </div>
  );
};

export { EnergySlider };

export default EnergyForm;
