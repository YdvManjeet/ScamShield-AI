import React from "react";

export default function Card({ children, className = "", style = {} }) {
  return (
    <div className={`ss-card ${className}`} style={style}>
      {children}
    </div>
  );
}
