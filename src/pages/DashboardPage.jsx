import React from "react";
import {
  ShieldCheck, ShieldAlert, TrendingUp, Info, CheckCircle2, AlertTriangle, Clock, GraduationCap
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarArea,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import Card from "../components/Card";
import Badge from "../components/Badge";
import ScoreGauge from "../components/ScoreGauge";
import EmptyState from "../components/EmptyState";
import {
  getExplainability,
  COMPONENT_LABELS,
  STRENGTH_NOTES,
  IMPROVEMENT_ACTIONS,
  SCORE_HISTORY,
  TRENDING_SCAMS
} from "../services/scamEngine";

const CURRENT_USER = {
  name: "Anjali",
  timeOfDay: () => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  },
};

export default function DashboardPage({
  components,
  score,
  status,
  showExplain,
  setShowExplain,
  guardianMode,
  events,
  missions,
  onStartMission
}) {
  const radarData = Object.entries(components).map(([key, d]) => ({
    subject: COMPONENT_LABELS[key].split(" ")[0],
    value: d.value,
    full: 100,
  }));
  const { strengths, weaknesses } = getExplainability(components);
  
  // Blend the seeded historical trend with today's live, event-derived score
  const chartData = [...SCORE_HISTORY.slice(0, -1), { month: "Jul", score }];
  const scoreDelta = score - SCORE_HISTORY[0].score;
  const thisMonthDelta = score - SCORE_HISTORY[SCORE_HISTORY.length - 2].score;
  const recentEvents = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  return (
    <div className="ss-page">
      <div className="ss-hero">
        <div>
          <div className="ss-eyebrow">Good {CURRENT_USER.timeOfDay()}</div>
          <h1>{CURRENT_USER.name}</h1>
          <p className="ss-hero-sub">Here's where your scam preparedness stands today.</p>
        </div>
        {guardianMode && (
          <div className="ss-guardian-banner">
            <ShieldAlert size={16} />
            Guardian Mode active — monitoring linked accounts in your Safety Circle
          </div>
        )}
      </div>

      <div className="ss-grid-2">
        <Card className="ss-score-card">
          <ScoreGauge score={score} />
          <div className="ss-score-meta">
            <Badge tone={status.tone} icon={status.tone === "danger" ? ShieldAlert : ShieldCheck}>
              {status.label}
            </Badge>
            <div className="ss-score-delta">
              <TrendingUp size={14} /> +{Math.max(0, scoreDelta)} since Feb
              <span className="ss-score-delta-month">· {thisMonthDelta >= 0 ? "+" : ""}{thisMonthDelta} this month</span>
            </div>
            <button className="ss-link-btn" onClick={() => setShowExplain(!showExplain)}>
              <Info size={14} /> Why is my score {score}?
            </button>
          </div>
        </Card>

        <Card>
          <div className="ss-card-title">Score Composition</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="var(--surface-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <RadarArea dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {showExplain && (
        <Card className="ss-explain">
          <div className="ss-card-title"><Info size={15} /> Why your score is {score}</div>
          <div className="ss-explain-grid">
            <div>
              <div className="ss-explain-label safe">Strengths</div>
              {strengths.map((s) => (
                <div key={s.key} className="ss-explain-row">
                  <CheckCircle2 size={14} className="ss-icon-safe" />
                  <div>
                    <strong>{COMPONENT_LABELS[s.key]} — {s.value}</strong>
                    <p>{STRENGTH_NOTES[s.key]}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="ss-explain-label warning">Where to improve</div>
              {weaknesses.map((w) => (
                <div key={w.key} className="ss-explain-row">
                  <AlertTriangle size={14} className="ss-icon-warning" />
                  <div>
                    <strong>{COMPONENT_LABELS[w.key]} — {w.value}</strong>
                    <p>{IMPROVEMENT_ACTIONS[w.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ss-explain-formula">
            Weighted formula: Awareness 25% · Digital Behaviour 20% · Payment Safety 20% · Simulation Performance 20% · Response Readiness 15%
          </div>
        </Card>
      )}

      <div className="ss-component-bars">
        {Object.entries(components).map(([key, d]) => (
          <div key={key} className="ss-comp-row">
            <div className="ss-comp-label">{COMPONENT_LABELS[key]}</div>
            <div className="ss-comp-track">
              <div className="ss-comp-fill" style={{ width: `${d.value}%` }} />
            </div>
            <div className="ss-comp-value">{d.value}</div>
          </div>
        ))}
      </div>

      <div className="ss-grid-4">
        <Card>
          <div className="ss-card-title"><TrendingUp size={15} /> Scam Immunity Over Time</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--surface-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[30, 100]} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="ss-card-title"><Clock size={15} /> Recent Score Activity</div>
          {recentEvents.length ? (
            <div className="ss-mini-list">
              {recentEvents.map((e) => (
                <div key={e.id} className="ss-event-row">
                  <span className={`ss-event-delta ${e.delta > 0 ? "safe" : e.delta < 0 ? "danger" : ""}`}>{e.delta > 0 ? "+" : ""}{e.delta}</span>
                  <div>
                    <div className="ss-event-reason">{e.reason}</div>
                    <div className="ss-event-date">{new Date(e.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · {COMPONENT_LABELS[e.category]}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Clock} title="No activity yet" body="Score events appear here as you complete missions and simulations." />}
        </Card>

        <Card>
          <div className="ss-card-title"><ShieldAlert size={15} /> Trending Scams</div>
          <div className="ss-mini-list">
            {TRENDING_SCAMS.slice(0, 3).map((s) => (
              <div key={s.id} className="ss-mini-item">
                <s.icon size={15} className={`ss-icon-${s.severity === "critical" ? "danger" : s.severity === "high" ? "warning" : "safe"}`} />
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="ss-card-title"><GraduationCap size={15} /> Recommended Mission</div>
          {(() => {
            const next = missions.find((m) => !m.done);
            return next ? (
              <div className="ss-mission-mini">
                <div className="ss-mission-mini-title">{next.title}</div>
                <div className="ss-mission-mini-desc">{next.desc}</div>
                <div className="ss-mission-mini-meta"><Clock size={12} /> {next.minutes} min · +{next.gain} pts</div>
                <button
                  className="ss-btn-secondary"
                  onClick={() => onStartMission(next.id)}
                  style={{ padding: "4px 8px", fontSize: "11px", height: "auto" }}
                >
                  Start Mission
                </button>
              </div>
            ) : <EmptyState icon={CheckCircle2} title="All caught up" body="You've completed every available mission." />;
          })()}
        </Card>
      </div>
    </div>
  );
}
