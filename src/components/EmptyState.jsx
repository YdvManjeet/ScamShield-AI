import React from "react";

export default function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="ss-empty">
      <Icon size={28} strokeWidth={1.6} />
      <div className="ss-empty-title">{title}</div>
      <div className="ss-empty-body">{body}</div>
    </div>
  );
}
