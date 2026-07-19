import React from "react";
import { GraduationCap, CheckCircle2, Clock } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import { COMPONENT_LABELS } from "../services/scamEngine";

export default function LearnPage({ missions, onComplete }) {
  return (
    <div className="ss-page">
      <SectionHeading eyebrow="Learn" title="Scam Missions" />
      <div className="ss-grid-3">
        {missions.map((m) => (
          <Card key={m.id} className="ss-mission-card">
            <div className="ss-mission-top">
              <GraduationCap size={18} className="ss-icon-accent" />
              {m.done && <Badge tone="safe" icon={CheckCircle2}>Done</Badge>}
            </div>
            <div className="ss-card-title">{m.title}</div>
            <p className="ss-scenario-desc">{m.desc}</p>
            <div className="ss-mission-mini-meta">
              <Clock size={12} /> {m.minutes} min · +{m.gain} pts to {COMPONENT_LABELS[m.component]}
            </div>
            <button className="ss-btn-secondary" disabled={m.done} onClick={() => onComplete(m.id)}>
              {m.done ? "Completed" : "Start mission"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
