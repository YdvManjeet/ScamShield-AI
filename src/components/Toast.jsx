import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="ss-toast" role="status">
      <CheckCircle2 size={16} />
      {toast}
    </div>
  );
}
