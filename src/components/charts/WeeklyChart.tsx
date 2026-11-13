// ============================================================================
// DevPilot - Weekly Study Hours SVG Bar Chart
// ============================================================================
import React, { useState } from 'react';

interface WeeklyChartProps {
  data: { day: string; hours: number }[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxHours = Math.max(...data.map(d => d.hours), 5);
  // Grid lines
  const gridSteps = [0, Math.round(maxHours * 0.25), Math.round(maxHours * 0.5), Math.round(maxHours * 0.75), maxHours];

  const chartHeight = 160;
  const chartWidth = 500;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const barWidth = Math.min(innerWidth / data.length - 12, 36);

  return (
    <div className="w-full select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
      >
        {/* Horizontal grid lines */}
        {gridSteps.map((step, idx) => {
          const y = paddingTop + innerHeight - (step / maxHours) * innerHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
                className="font-mono"
              >
                {step}h
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = paddingLeft + (idx + 0.5) * (innerWidth / data.length) - barWidth / 2;
          const barHeight = (item.hours / maxHours) * innerHeight;
          const y = paddingTop + innerHeight - barHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={item.day}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all duration-200"
            >
              {/* Invisible touch/hover area */}
              <rect
                x={x - 6}
                y={paddingTop}
                width={barWidth + 12}
                height={innerHeight + paddingBottom}
                fill="transparent"
              />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 3)}
                rx="5"
                fill={isHovered ? '#818cf8' : '#6366f1'}
                className="transition-colors duration-150"
              />

              {/* Day label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                fill={isHovered ? '#ffffff' : '#94a3b8'}
                fontSize="11"
                fontWeight={isHovered ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {item.day}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 32}
                    y={Math.max(y - 28, 2)}
                    width="64"
                    height="22"
                    rx="5"
                    fill="#0f172a"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(y - 13, 17)}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {item.hours} hrs
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
