import React, { useState } from "react";
import Button from './Button';

interface NumberSliderProps {
  imageSrc: string;
  simplify: number;
  setSimplify: (simplify: number) => void;
  grabColors: (img: HTMLImageElement, count: number) => void;
}

const NumberSlider = ({
  simplify,
  setSimplify,
  grabColors,
  imageSrc,
}: NumberSliderProps) => {
  // Keep track of the timer ID
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [enableHighQuality, setEnableHighQuality] = useState<boolean>(false);

  function changeSimplify(num: number) {

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => grabColors(img, num);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const num = parseInt(e.target.value);
    setSimplify(num);
    // Clear any pending timeouts
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set a new timeout to call changeSimplify after 1.5 seconds
    const newTimerId = setTimeout(() => {
      changeSimplify(num);
    }, 1500);

    // Store the new timer ID
    setTimerId(newTimerId);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-[23px]">
      <input
        type="range"
        min="2"
        max={enableHighQuality ? "128" : "16"}
        step="1"
        value={simplify}
        onChange={handleChange}
        className="w-full max-w-md cursor-pointer"
      />
      <Button label={`${enableHighQuality ? 'Disable' : 'Enable'} high quality`} onClick={() => setEnableHighQuality(!enableHighQuality)} />
    </div>
  );
};

export default NumberSlider;
