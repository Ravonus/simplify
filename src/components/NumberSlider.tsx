import React, { useState } from "react";

interface NumberSliderProps {
  simplify: number;
  setSimplify: (simplify: number) => void;
}

const NumberSlider = ({ simplify, setSimplify }: NumberSliderProps) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimplify(Number(e.target.value));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="range"
        min="2"
        max="16"
        step="1"
        value={simplify}
        onChange={handleChange}
        className="w-full max-w-md cursor-pointer"
      />
      <div className="text-lg font-semibold">{simplify}</div>
    </div>
  );
};

export default NumberSlider;
