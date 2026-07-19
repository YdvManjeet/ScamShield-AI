import React from "react";

const TONE_COLOR = {
  danger: "var(--danger)",
  warning: "var(--warning)",
  safe: "var(--safe)",
  "safe-strong": "var(--safe-strong)",
  info: "var(--accent)",
};

const TONE_BG = {
  danger: "rgba(239,68,68,0.16)",
  warning: "rgba(245,158,11,0.16)",
  safe: "rgba(34,197,94,0.16)",
  "safe-strong": "rgba(52,211,153,0.16)",
  info: "rgba(59,130,246,0.16)",
};

const TONE_BORDER = {
  danger: "rgba(239,68,68,0.4)",
  warning: "rgba(245,158,11,0.4)",
  safe: "rgba(34,197,94,0.4)",
  "safe-strong": "rgba(52,211,153,0.4)",
  info: "rgba(59,130,246,0.4)",
};

export default function Badge({ tone = "info", children, icon: Icon }) {
  return (
    <span
      className="ss-badge"
      style={{
        color: TONE_COLOR[tone],
        background: TONE_BG[tone],
        borderColor: TONE_BORDER[tone],
      }}
    >
      {Icon && <Icon size={13} strokeWidth={2.4} />}
      {children}
    </span>
  );
}
export { TONE_COLOR, TONE_BG, TONE_BORDER };
