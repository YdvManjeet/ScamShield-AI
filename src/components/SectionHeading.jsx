import React from "react";

export default function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="ss-section-heading">
      <div>
        {eyebrow && <div className="ss-eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
