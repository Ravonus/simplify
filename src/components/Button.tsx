import React, { type ButtonHTMLAttributes } from "react";

type ButtonProps = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ label, ...props }) => (
  <button
    {...props}
    className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition-colors duration-700 ease-in-out cursor-pointer shadow-md hover:shadow-lg active:shadow-none active:bg-blue-700" 
  >
    {label}
  </button>
);

export default Button;
