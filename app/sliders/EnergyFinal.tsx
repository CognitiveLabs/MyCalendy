'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';

interface EnergySliderProps {
  energyvalue: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const EnergySlider: React.FC<EnergySliderProps> = ({
  energyvalue,
  onChange
}) => {
  const shouldShift = energyvalue > -1 && energyvalue < 101;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--energy-value',
      energyvalue.toString()
    );
  }, [energyvalue]);

  return (
    <div className="energy-slider-container">
      <div className="energycontrol">
        <input
          id="track"
          type="range"
          min="0"
          max="100"
          value={energyvalue}
          onChange={onChange}
          className="energyslider-input"
        />
        <div
          className="energytooltip"
          style={{ '--shift': shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
        <div
          className="energycontrol__track"
          style={{ '--shift': shouldShift ? 1 : 0 } as React.CSSProperties}
        ></div>
      </div>
      <style>{EnergySliderStyle}</style>
    </div>
  );
};

const EnergyForm: React.FC = () => {
  const [energyslidervalue, setEnergyslidervalue] = useState<number>(50);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const energyvalue = parseInt(event.target.value, 10);
    setEnergyslidervalue(energyvalue);
    document.documentElement.style.setProperty(
      '--energy-value',
      energyvalue.toString()
    );
  };

  return (
    <div>
      <h2 className="text-center">How energized are you today?</h2>
      <br />
      <form>
        <EnergySlider
          energyvalue={energyslidervalue}
          onChange={handleSliderChange}
        />
        <br />
        <br />
      </form>
    </div>
  );
};

const EnergySliderStyle = `
  .energytooltip::before {
    color: white;
    content: var(--energyLabel, "energy") " " counter(low) "%";
    left: 0.5rem;
  }

  .energytooltip::after {
    color: white;
    content: var(--waterLabel, ) ;
    right: 0.5rem;
  }

  .energycontrol__track::before {
    background: green;
  }

  .energycontrol__track::after {
  
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

.energy-slider-container {
  width: 300px; /* Adjust the width as needed */
  margin: 0 auto;
}

.energycontrol {
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

.energycontrol:focus-within,
.energycontrol:hover {
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

.energytooltip {
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
  counter-reset: low var(--energy-value) high calc(100 - var(--energy-value));
}

.energytooltip::before,
.energytooltip::after {
  --range: calc((50 - (var(--energy-value) / 100 * 10)) * 1%);
  font-variant: tabular-nums;
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  font-family: monospace;
}

.energycontrol__track {
  --energy: hsl(
    24 74% calc(24% + (30% * (var(--energy-value, 0) / 100))) / 0.4
  );
  --water: hsl(0 0% 100% / calc(0.1 + (0.4 * (var(--energy-value, 0) / 100))));
  height: calc(50% + (var(--shift) * 50%));
  width: 100%;
  position: absolute;
  bottom: 0;
  pointer-events: none;
  transition: height var(--speed) var(--timing);
}

.energycontrol__track::before,
.energycontrol__track::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  transition: width var(--energy--update);
}

.energycontrol__track::before {
  left: 0;
  width: calc(var(--energy-value, 0) * 1% - 0.5rem);
}

.energycontrol__track::after {
  right: 0;
  width: calc((100 - var(--energy-value, 0)) * 1% - 0.5rem);
}

.energycontrol__indicator {
  height: 5%;
  border-radius: 4px;
  width: 4px;
  position: absolute;
  top: 50%;
  background: hsl(0 0% 100% / calc((var(--active, 0) * 0.5) + 0.5));
  left: calc(var(--energy-value, 0) * 1%);
  z-index: 2;
  translate: -50% -50%;
  transition: left var(--energy--update), background var(--energy--update);
}

.energyslider-input {
  position: relative;
  width: 100%;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
}

`;

export { EnergySlider, EnergySliderStyle };

export default EnergyForm;
