'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';

interface MorningSliderProps {
  morningvalue: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const MorningSlider: React.FC<MorningSliderProps> = ({
  morningvalue,
  onChange
}) => {
  const shouldShift = morningvalue > -1 && morningvalue < 101;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--morning-value',
      morningvalue.toString()
    );
  }, [morningvalue]);

  return (
    <div className="morning-slider-container">
      <div className="morningcontrol">
        <input
          id="track"
          type="range"
          min="0"
          max="100"
          value={morningvalue}
          onChange={onChange}
          className="morningslider-input"
        />
        <div
          className="morningtooltip"
          style={{ '--shift': shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
        <div
          className="morningcontrol__track"
          style={{ '--shift': shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
      </div>
      <style>{MorningSliderStyle}</style>
    </div>
  );
};

const MorningForm: React.FC = () => {
  const [morningslidervalue, setMorningslidervalue] = useState<number>(50);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const morningvalue = parseInt(event.target.value, 10);
    setMorningslidervalue(morningvalue);
    document.documentElement.style.setProperty(
      '--morning-value',
      morningvalue.toString()
    );
  };

  return (
    <div>
      <h2 className="text-center">
        Over the last few weeks, have you been more of a morning or evening
        person?
      </h2>
      <br />
      <form>
        <MorningSlider
          morningvalue={morningslidervalue}
          onChange={handleSliderChange}
        />
        <br />
        <br />
      </form>
    </div>
  );
};

const MorningSliderStyle = `
  .morningtooltip::before {
    color: white;
    content: var(--morningLabel, "morning") " " counter(low) "%";
    left: 0.5rem;
  }

  .morningtooltip::after {
    color: white;
    content: var(--eveningLabel, "evening") " " counter(high) "%";
    right: 0.5rem;
  }

  .morningcontrol__track::before {
    background: orange;
  }

  .morningcontrol__track::after {
    background: var(--eveningColor, hsla(236, 74%, 54%, 0.5));
  }

  @font-face {
  font-family: "Geist Sans";
  src: url("https://assets.codepen.io/605876/GeistVF.ttf") format("truetype");
}

*,
*:after,
*:before {
  box-sizing: border-box;
}

.morning-slider-container {
  width: 300px; /* Adjust the width as needed */
  margin: 0 auto;
}

.morningcontrol {
  position: relative;
  display: grid;
  place-items: center;
  margin: 0 auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.morningcontrol:focus-within,
.morningcontrol:hover {
  --active: 1;
}

[type="range"] {
  width: 300px;
  opacity: 0;
  height: 60px;
}

[type="range"]:hover {
  cursor: -webkit-grab;
}

[type="range"]:active {
  cursor: -webkit-grabbing;
}

[type="range"]:focus-visible {
  outline-offset: 0.25rem;
  outline-color: transparent;
}

[type="range"]::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  height: 120px;
  width: 40px;
  margin-top: 0px;
  opacity: 1;
}

[type="range"]::-webkit-slider-runnable-track,
[type="range"]::-moz-range-track {
  height: 120px;
  background: hsla(202, 91%, 78%, 0.5);
  margin-top: -60px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}

.morningtooltip {
  font-size: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
  transform: translateY(calc(var(--shift, 0) * 50%));
  transition: transform var(--speed) var(--timing);
  z-index: 2;
  counter-reset: low var(--morning-value) high calc(100 - var(--morning-value));
}

.morningtooltip::before,
.morningtooltip::after {
  --range: calc((50 - (var(--morning-value) / 100 * 10)) * 1%);
  font-variant: tabular-nums;
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  font-family: monospace;
}

.morningcontrol__track {
  --morning: hsl(
    24 74% calc(24% + (30% * (var(--morning-value, 0) / 100))) / 0.4
  );
  --evening: hsl(0 0% 100% / calc(0.1 + (0.4 * (var(--morning-value, 0) / 100))));
  height: calc(50% + (var(--shift) * 50%));
  width: 100%;
  position: absolute;
  bottom: 0;
  pointer-events: none;
  transition: height var(--speed) var(--timing);
}

.morningcontrol__track::before,
.morningcontrol__track::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  transition: width var(--morning--update);
}

.morningcontrol__track::before {
  left: 0;
  width: calc(var(--morning-value, 0) * 1% - 0.5rem);
}

.morningcontrol__track::after {
  right: 0;
  width: calc((100 - var(--morning-value, 0)) * 1% - 0.5rem);
}

.morningcontrol__indicator {
  height: 5%;
  border-radius: 4px;
  width: 4px;
  position: absolute;
  top: 50%;
  background: hsl(0 0% 100% / calc((var(--active, 0) * 0.5) + 0.5));
  left: calc(var(--morning-value, 0) * 1%);
  z-index: 2;
  translate: -50% -50%;
  transition: left var(--morning--update), background var(--morning--update);
}

.morningslider-input {
  position: relative;
  width: 100%;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
}


`;

export { MorningSlider, MorningSliderStyle };

export default MorningForm;
