import React, { useMemo } from "react";
import { GraduationCap, CheckCircle2, Clock, Lock, Trophy, ShieldCheck, BookOpen, AlertCircle } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import { COMPONENT_LABELS } from "../services/scamEngine";

// Definitions for the 5 professional badges
const BADGES_LIST = [
  {
    key: "digital-arrest-defender",
    name: "Digital Arrest Defender",
    desc: "Earned by identifying digital arrest threats and impersonations.",
    howToEarn: "Complete 'Spot the fake CBI call' mission."
  },
  {
    key: "upi-guardian",
    name: "UPI Guardian",
    desc: "Demonstrates secure payment habits and understanding of UPI PIN rules.",
    howToEarn: "Complete 'Secure your UPI app' mission."
  },
  {
    key: "phishing-spotter",
    name: "Phishing Spotter",
    desc: "Recognizes QR code capture links and malicious phishing vectors.",
    howToEarn: "Complete 'QR codes: scan safely' mission."
  },
  {
    key: "family-protector",
    name: "Family Protector",
    desc: "Protects others by expanding the safety circle interface.",
    howToEarn: "Complete at least 2 safety learning missions."
  },
  {
    key: "scam-resistant",
    name: "Scam Resistant",
    desc: "Highest level of readiness achieved across multiple scam categories.",
    howToEarn: "Complete 4 or more safety learning missions."
  }
];

export default function LearnPage({ 
  missions, 
  onComplete, 
  onResetMissions,
  components, 
  xp = 0, 
  streak = 3, 
  badges = [] 
}) {

  // 1. Identify the user's weakest component
  const weakestComponent = useMemo(() => {
    if (!components) return null;
    let weakestKey = null;
    let lowestVal = Infinity;
    Object.entries(components).forEach(([key, data]) => {
      if (data.value < lowestVal) {
        lowestVal = data.value;
        weakestKey = key;
      }
    });
    return weakestKey;
  }, [components]);

  // 2. Recommend the active mission corresponding to the weakest component
  const recommendedMission = useMemo(() => {
    if (!missions) return null;
    // Find first uncompleted mission that matches the weakest component
    let recommended = missions.find(m => !m.done && m.component === weakestComponent);
    // Fallback: If none matches or all are done, find first uncompleted mission overall
    if (!recommended) {
      recommended = missions.find(m => !m.done);
    }
    return recommended;
  }, [missions, weakestComponent]);

  // Filter out recommended mission from the remaining grid
  const remainingMissions = useMemo(() => {
    if (!missions) return [];
    if (!recommendedMission) return missions;
    return missions.filter(m => m.id !== recommendedMission.id);
  }, [missions, recommendedMission]);

  return (
    <div className="ss-page" style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "10px" }}>
        <SectionHeading eyebrow="Education & Training" title="Learning Missions" />

        {/* Gamification stats banner inside Learn tab */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
            <span>🔥</span>
            <span><strong>{streak} Days</strong> Streak</span>
          </div>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
            <span>⭐</span>
            <span><strong>{xp} XP</strong> Accumulated</span>
          </div>
        </div>
      </div>

      {/* RECOMMENDED DAILY MISSION */}
      {recommendedMission ? (
        <Card style={{ 
          padding: "24px", 
          border: "1.5px solid var(--accent)", 
          background: "rgba(59, 130, 246, 0.03)", 
          borderRadius: "14px",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--accent-strong)", display: "flex", alignItems: "center", gap: "4px" }}>
              <BookOpen size={14} /> TODAY'S RECOMMENDED MISSION
            </span>
            <span className="ss-badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)", border: "1px dashed var(--warning)", fontSize: "11px" }}>
              Targeting: {COMPONENT_LABELS[recommendedMission.component]}
            </span>
          </div>

          <h2 style={{ fontSize: "22px", margin: "10px 0 6px" }}>{recommendedMission.title}</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
            {recommendedMission.desc}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "13px", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={13} /> {recommendedMission.minutes} mins</span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--safe-strong)" }}>🎯 +{recommendedMission.gain} pts Scam Immunity</span>
            </div>
            
            <button 
              className="ss-btn-primary" 
              style={{ width: "auto", margin: 0, padding: "8px 18px", fontSize: "13px" }}
              onClick={() => onComplete(recommendedMission.id)}
            >
              Start Mission
            </button>
          </div>

          {/* Target area explanation */}
          {weakestComponent === recommendedMission.component && (
            <div style={{ marginTop: "14px", display: "flex", gap: "6px", alignItems: "center", padding: "8px 12px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", fontSize: "12px", color: "var(--text)" }}>
              <AlertCircle size={14} color="var(--warning)" />
              <span>Recommended because <strong>{COMPONENT_LABELS[weakestComponent]}</strong> is currently your weakest protection area.</span>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ 
          padding: "24px", 
          textAlign: "center", 
          background: "rgba(34, 197, 94, 0.03)", 
          border: "1px dashed var(--safe-strong)", 
          borderRadius: "14px", 
          marginBottom: "24px" 
        }}>
          <CheckCircle2 size={32} color="var(--safe-strong)" style={{ margin: "0 auto 10px" }} />
          <h3 style={{ margin: 0, fontSize: "18px" }}>All Completed!</h3>
          <p style={{ margin: "4px 0 12px", fontSize: "13.5px", color: "var(--text-muted)" }}>
            You have successfully completed all recommended safety learning missions.
          </p>
          <button 
            className="ss-btn-primary" 
            style={{ width: "auto", margin: "0 auto" }}
            onClick={onResetMissions}
          >
            Reset Progress & Replay
          </button>
        </Card>
      )}

      {/* OTHER AVAILABLE SCAM MISSION CARDS */}
      <h3 style={{ fontSize: "16px", margin: "0 0 12px" }}>Other Safety Missions</h3>
      <div className="ss-grid-2" style={{ gap: "16px", marginBottom: "28px" }}>
        {remainingMissions.map((m) => (
          <Card key={m.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <GraduationCap size={16} className="ss-icon-accent" />
                {m.done && <Badge tone="safe" icon={CheckCircle2}>Completed</Badge>}
              </div>
              <div className="ss-card-title" style={{ marginTop: "10px", fontSize: "15px" }}>{m.title}</div>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "4px 0 12px", lineHeight: 1.4 }}>{m.desc}</p>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--surface-border)", paddingTop: "10px", marginTop: "10px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                <Clock size={11} style={{ verticalAlign: "middle", marginRight: "3px" }} /> {m.minutes} min · +{m.gain} pts to {COMPONENT_LABELS[m.component]}
              </div>
              <button 
                className="ss-btn-secondary" 
                disabled={m.done} 
                onClick={() => onComplete(m.id)}
                style={{ padding: "4px 10px", height: "auto", fontSize: "12px", margin: 0, width: "auto" }}
              >
                {m.done ? "Finished" : "Start"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* PROFESSIONAL BADGES DRAWER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 12px" }}>
        <h3 style={{ fontSize: "16px", margin: 0 }}>Safety Badges & Achievements</h3>
        {missions && missions.some(m => m.done) && (
          <button 
            className="ss-link-btn" 
            style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, padding: 0 }}
            onClick={onResetMissions}
          >
            Reset Completed Missions
          </button>
        )}
      </div>
      <div className="ss-grid-3" style={{ gap: "16px" }}>
        {BADGES_LIST.map((b) => {
          const isUnlocked = badges.includes(b.key);
          return (
            <Card 
              key={b.key} 
              style={{ 
                padding: "16px", 
                border: isUnlocked ? "1.5px solid rgba(245, 158, 11, 0.45)" : "1px solid var(--surface-border)",
                background: isUnlocked ? "rgba(245, 158, 11, 0.02)" : "var(--surface)",
                opacity: isUnlocked ? 1 : 0.65,
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ 
                background: isUnlocked ? "rgba(245, 158, 11, 0.15)" : "rgba(156, 163, 175, 0.1)", 
                borderRadius: "50%", 
                padding: "8px", 
                color: isUnlocked ? "var(--warning)" : "var(--text-muted)",
                flexShrink: 0
              }}>
                {isUnlocked ? <Trophy size={20} /> : <Lock size={20} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <strong style={{ fontSize: "14px", color: isUnlocked ? "white" : "var(--text-muted)" }}>{b.name}</strong>
                  {isUnlocked && <ShieldCheck size={14} color="var(--safe-strong)" />}
                </div>
                <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{b.desc}</p>
                {!isUnlocked && (
                  <span style={{ fontSize: "11px", color: "var(--accent-strong)", fontWeight: "600" }}>🔒 {b.howToEarn}</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
