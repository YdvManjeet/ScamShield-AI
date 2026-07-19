import React from "react";
import { getScoreStatus } from "../services/scamEngine";
import { TONE_COLOR } from "./Badge";

export default function ScoreGauge({ score, size = 176 }) {
  const status = getScoreStatus(score);
  const r = (size - 20) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = TONE_COLOR[status.tone];
  
  return (
    <div className="ss-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-border)" strokeWidth="12" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ss-gauge-arc"
        />
      </svg>
      <div className="ss-gauge-center">
        <div className="ss-gauge-score">{score}</div>
        <div className="ss-gauge-max">/ 100</div>
      </div>
    </div>
  );
}
