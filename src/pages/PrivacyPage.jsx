import React from "react";
import { ShieldCheck, Lock, Users, Server, Database, EyeOff } from "lucide-react";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";

export default function PrivacyPage() {
  return (
    <div className="ss-page" style={{ animation: "fadeIn 0.3s ease", paddingBottom: "40px" }}>
      <SectionHeading eyebrow="Transparency Shield" title="Privacy Center" />

      <Card style={{ background: "rgba(59, 130, 246, 0.03)", border: "1.5px solid var(--accent)", padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px" }}>
          <ShieldCheck size={22} className="ss-icon-safe" /> Our Privacy Commitment
        </h2>
        <p style={{ margin: 0, fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          At ScamShield AI, we believe safety and privacy must coexist. Scammers use isolation to manipulate targets; we reconnect you safely without ever compromising your digital security. Below is a complete disclosure of how our platform handles your telemetry and datasets.
        </p>
      </Card>

      <div className="ss-grid-2" style={{ gap: "20px", marginBottom: "24px" }}>
        
        {/* What is Analyzed */}
        <Card style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
            <Server size={18} className="ss-icon-accent" /> What Data is Analyzed
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            - **Scan Texts**: Content you copy-paste into Scam Scanner is analyzed to extract safety signals.
            - **Conversational Queries**: Prompts sent to the AI Scam Coach are evaluated to provide safety recommendations.
            - **Demographic profile**: Non-sensitive descriptors (e.g. age range) gathered during onboarding to personalize learning challenges.
          </p>
        </Card>

        {/* What is Stored */}
        <Card style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
            <Database size={18} className="ss-icon-accent" /> Where It is Stored (Local Sandbox)
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            All user data, scam history logs, safety events, learning XP, and safety circle contacts are **stored locally in your browser/app sandbox (localStorage)**.
            We do not maintain central databases logging your personal identity or credentials.
          </p>
        </Card>

        {/* What is Shared */}
        <Card style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
            <EyeOff size={18} className="ss-icon-accent" /> What is Shared
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            - **No Automatic Sharing**: Scam Scanner results and AI Coach chats are never shared with anyone, including your Safety Circle, without your explicit manual trigger.
            - **Anonymized Radar Telemetry**: Scam Radar reports are aggregated on a city/district level to extract trends. Exact names, phone numbers, or addresses are never collected or shared.
          </p>
        </Card>

        {/* Safety Circle Permissions */}
        <Card style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
            <Users size={18} className="ss-icon-accent" /> Safety Circle Boundaries
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            Safety Circle contacts are only alerted if you manually choose to click "Contact Safety Circle" and send a verification alert template.
            ScamShield never tracks or monitors your contacts' devices.
          </p>
        </Card>
      </div>

      {/* User Controls Panel */}
      <Card style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px" }}>
          <Lock size={18} className="ss-icon-warning" /> User Autonomy & Controls
        </h3>
        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 14px" }}>
          You remain in full control of your safety telemetry. At any time, you can purge your scanning records, erase conversational backups, and delete Safety Circle contacts directly from the Profile Settings tab.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Badge tone="safe">Local Sandbox Encryption</Badge>
          <Badge tone="info">Zero Trackers Policy</Badge>
          <Badge tone="warning">Anonymized Telemetry</Badge>
        </div>
      </Card>
    </div>
  );
}
