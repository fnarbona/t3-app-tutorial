import React from "react";

type ProgressProps = { radius: number; stroke: number; progress: number };

function Progress({ radius, stroke, progress }: ProgressProps) {
  const normalizedProgress = progress > 100 ? 100 : progress;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;
  return (
    <div className="relative flex h-full w-10 items-center justify-center">
      <svg height={radius * 2} width={radius * 2} transform="rotate(270)">
        <circle
          stroke="white"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <span className="absolute text-center text-[10px] text-white">{`${normalizedProgress}`}</span>
    </div>
  );
}

export default Progress;
