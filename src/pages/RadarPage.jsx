import React, { useState } from "react";
import { MapPin } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import { TRENDING_SCAMS, REGION_HEATMAP } from "../services/scamEngine";

export default function RadarPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? TRENDING_SCAMS : TRENDING_SCAMS.filter((s) => s.severity === filter);
  const levelTone = { critical: "danger", high: "warning", medium: "info", low: "safe" };

  return (
    <div className="ss-page">
      <SectionHeading
        eyebrow="Scam Radar"
        title="Live scam activity across India"
        action={
          <select className="ss-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by severity">
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        }
      />
      <div className="ss-grid-2">
        {filtered.map((s) => (
          <Card key={s.id} className="ss-radar-card">
            <s.icon size={20} className={`ss-icon-${s.severity === "critical" ? "danger" : s.severity === "high" ? "warning" : "safe"}`} />
            <div>
              <div className="ss-card-title">{s.title}</div>
              <div className="ss-radar-meta"><MapPin size={12} /> {s.region} · {s.reports.toLocaleString()} reports this month</div>
            </div>
            <Badge tone={levelTone[s.severity]}>{s.severity}</Badge>
          </Card>
        ))}
      </div>

      <div className="ss-card-title" style={{ marginTop: 8 }}>Regional Report Density</div>
      <div className="ss-heatmap">
        {REGION_HEATMAP.map((r) => (
          <div key={r.region} className={`ss-heat-cell ss-heat-${r.level}`}>
            <div className="ss-heat-region">{r.region}</div>
            <div className="ss-heat-count">{r.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
