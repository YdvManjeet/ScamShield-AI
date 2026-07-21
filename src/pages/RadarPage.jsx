import React, { useState } from "react";
import { 
  ShieldAlert, BarChart2, PieChart as PieIcon, 
  Layers, Info, Activity 
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";

// Demo stats and hotspot details
const HOTSPOTS = [
  {
    id: "delhi",
    city: "Delhi",
    x: 140,
    y: 95,
    scamType: "Digital Arrest & Police Impersonation",
    trend: "Rising (+37%)",
    reports: 1420,
    tactics: "Fake Skype video interrogations, Aadhaar drug package warnings, arrest threats.",
    recommendation: "Hang up immediately. Police and CBI do not conduct official trials over video calls."
  },
  {
    id: "gurugram",
    city: "Gurugram",
    x: 130,
    y: 110,
    scamType: "Fake Traffic Challan Alerts",
    trend: "Rising (+42%)",
    reports: 980,
    tactics: "SMS warning of unpaid road traffic fines with links to fake payment sites.",
    recommendation: "Check fines on the official Parivahan vahan portal only. Do not click random SMS domains."
  },
  {
    id: "mumbai",
    city: "Mumbai",
    x: 95,
    y: 200,
    scamType: "Electricity Bill Suspension Scam",
    trend: "Rising (+21%)",
    reports: 2130,
    tactics: "Warning texts threatening power cuts within 2 hours unless a custom contact number is called.",
    recommendation: "Call your official power grid number. Never download AnyDesk to update electricity bills."
  },
  {
    id: "bengaluru",
    city: "Bengaluru",
    x: 115,
    y: 270,
    scamType: "Remote Job & Video Like Fraud",
    trend: "Rising (+18%)",
    reports: 1840,
    tactics: "WFH tasks promising payouts for YouTube likes, requiring deposits for higher VIP levels.",
    recommendation: "Avoid any job that demands deposits to access work or register accounts."
  },
  {
    id: "hyderabad",
    city: "Hyderabad",
    x: 135,
    y: 220,
    scamType: "DHL / Courier Customs Blockage",
    trend: "Rising (+29%)",
    reports: 1120,
    tactics: "Robocalls claiming a parcel in your Aadhaar name contains illegal narcotics, demanding custom fees.",
    recommendation: "Use the official tracking ID on official courier websites. Do not pay over the phone."
  },
  {
    id: "jaipur",
    city: "Jaipur",
    x: 110,
    y: 125,
    scamType: "UPI QR Refund Scam",
    trend: "Rising (+15%)",
    reports: 760,
    tactics: "Fake buyer QR codes on OLX, telling the user to scan and enter PIN to receive payments.",
    recommendation: "You never need to enter your UPI PIN to receive money. PIN is only for sending."
  }
];

// Synthetic Chart Datasets
const REPORTS_OVER_TIME = [
  { month: "Feb", reports: 420 },
  { month: "Mar", reports: 680 },
  { month: "Apr", reports: 890 },
  { month: "May", reports: 1200 },
  { month: "Jun", reports: 1840 },
  { month: "Jul", reports: 2200 }
];

const CATEGORY_DISTRIBUTION = [
  { name: "Digital Arrest", value: 35, color: "#EF4444" },
  { name: "UPI / QR Tricks", value: 25, color: "#10B981" },
  { name: "Courier Customs", value: 20, color: "#F59E0B" },
  { name: "KYC SIM Block", value: 12, color: "#3B82F6" },
  { name: "Job WFH Tasks", value: 8, color: "#8B5CF6" }
];

const WEEKLY_TRENDS = [
  { name: "Digital Arrest", change: 37 },
  { name: "UPI Refund", change: 15 },
  { name: "FedEx Parcel", change: 29 },
  { name: "KYC SIM", change: -5 },
  { name: "WFH Tasks", change: 18 }
];

export default function RadarPage({ goTo }) {
  const [selectedHotspot, setSelectedHotspot] = useState(HOTSPOTS[0]);
  const [activeTab, setActiveTab] = useState("map"); // 'map' | 'charts' | 'campaigns'

  return (
    <div className="ss-page" style={{ animation: "fadeIn 0.3s ease" }}>
      <SectionHeading 
        eyebrow="Security Operations Center" 
        title="Community Scam Radar" 
        action={
          <div style={{ display: "flex", gap: "6px" }}>
            <button 
              className={`ss-btn-secondary ${activeTab === "map" ? "active" : ""}`}
              style={{ width: "auto", margin: 0, padding: "6px 12px", fontSize: "12px", minHeight: "auto", background: activeTab === "map" ? "var(--accent)" : "var(--surface-2)" }}
              onClick={() => setActiveTab("map")}
            >
              Hotspot Map
            </button>
            <button 
              className={`ss-btn-secondary ${activeTab === "charts" ? "active" : ""}`}
              style={{ width: "auto", margin: 0, padding: "6px 12px", fontSize: "12px", minHeight: "auto", background: activeTab === "charts" ? "var(--accent)" : "var(--surface-2)" }}
              onClick={() => setActiveTab("charts")}
            >
              Trend Analytics
            </button>
            <button 
              className={`ss-btn-secondary ${activeTab === "campaigns" ? "active" : ""}`}
              style={{ width: "auto", margin: 0, padding: "6px 12px", fontSize: "12px", minHeight: "auto", background: activeTab === "campaigns" ? "var(--accent)" : "var(--surface-2)" }}
              onClick={() => setActiveTab("campaigns")}
            >
              Campaign Clusters
            </button>
          </div>
        }
      />

      {/* Synthetic disclaimer badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.06)", border: "1px dashed rgba(245,158,11,0.3)", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px", color: "var(--warning)", marginTop: "-12px", marginBottom: "14px" }}>
        <Info size={14} />
        <span><strong>Prototype Note:</strong> Demo intelligence data for prototype demonstration. Anonymized mock reports.</span>
      </div>

      {/* Stats row cards */}
      <div className="ss-grid-5" style={{ gap: "14px", marginBottom: "16px" }}>
        <Card style={{ padding: "12px 14px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Digital Arrest</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: "700" }}>Rising</span>
            <span style={{ color: "var(--danger)", fontSize: "12px", fontWeight: "600" }}>+37%</span>
          </div>
        </Card>

        <Card style={{ padding: "12px 14px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Traffic Challan</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: "700" }}>Rising</span>
            <span style={{ color: "var(--danger)", fontSize: "12px", fontWeight: "600" }}>+42%</span>
          </div>
        </Card>

        <Card style={{ padding: "12px 14px", borderLeft: "4px solid var(--warning)" }}>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Electricity Bill</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: "700" }}>Moderate</span>
            <span style={{ color: "var(--warning)", fontSize: "12px", fontWeight: "600" }}>+21%</span>
          </div>
        </Card>

        <Card style={{ padding: "12px 14px", borderLeft: "4px solid var(--warning)" }}>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Job Task Groups</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: "700" }}>Stable</span>
            <span style={{ color: "var(--warning)", fontSize: "12px", fontWeight: "600" }}>+18%</span>
          </div>
        </Card>

        <Card style={{ padding: "12px 14px", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>FedEx Courier</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: "700" }}>Rising</span>
            <span style={{ color: "var(--danger)", fontSize: "12px", fontWeight: "600" }}>+29%</span>
          </div>
        </Card>
      </div>

      {/* Tab: Hotspot Map */}
      {activeTab === "map" && (
        <div className="ss-grid-2" style={{ gap: "24px" }}>
          
          {/* Cyber Command Radar Screen */}
          <Card style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(10, 15, 30, 0.9)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <div style={{ width: "100%", borderBottom: "1px solid rgba(59, 130, 246, 0.2)", paddingBottom: "10px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "13.5px", color: "var(--accent-strong)", display: "flex", gap: "6px", alignItems: "center" }}>
                <Activity size={14} /> LIVE HEATMAP (ANONYMISED TELEMETRY)
              </strong>
              <span className="ss-badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "var(--danger)", fontSize: "10px", fontWeight: "700" }}>SIMULATED ACTIVE SCOPE</span>
            </div>

            {/* Futuristic SVG Radar scope representation of India hotspots */}
            <div style={{ position: "relative", width: "300px", height: "360px", background: "radial-gradient(circle, rgba(16,24,48,1) 0%, rgba(8,12,24,1) 100%)", borderRadius: "14px", border: "1px solid rgba(59,130,246,0.15)", overflow: "hidden" }}>
              
              {/* Concentric radar grids */}
              <svg width="300" height="360" style={{ position: "absolute", inset: 0 }}>
                <circle cx="150" cy="180" r="45" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeDasharray="3,3" />
                <circle cx="150" cy="180" r="90" fill="none" stroke="rgba(59, 130, 246, 0.1)" />
                <circle cx="150" cy="180" r="135" fill="none" stroke="rgba(59, 130, 246, 0.05)" strokeDasharray="5,5" />
                
                {/* Radar sweep line */}
                <line x1="150" y1="180" x2="300" y2="90" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="1.5" strokeLinecap="round" style={{ transformOrigin: "150px 180px", animation: "spin 5s linear infinite" }} />
                
                {/* Hotspot nodes with pulsating waves */}
                {HOTSPOTS.map(h => {
                  const isSelected = h.id === selectedHotspot.id;
                  return (
                    <g key={h.id} style={{ cursor: "pointer" }} onClick={() => setSelectedHotspot(h)}>
                      {/* Pulsating beacon waves */}
                      <circle cx={h.x} cy={h.y} r="14" fill="none" stroke="var(--danger)" strokeWidth="1.5" style={{ transformOrigin: `${h.x}px ${h.y}px`, animation: "pulse-radar 1.8s infinite ease-out" }} />
                      
                      {/* Inner solid node */}
                      <circle cx={h.x} cy={h.y} r={isSelected ? 6 : 4} fill={isSelected ? "var(--warning)" : "var(--danger)"} stroke="white" strokeWidth="1" />
                      
                      {/* Label tag */}
                      <text x={h.x + 8} y={h.y + 4} fill={isSelected ? "var(--warning)" : "#9CA3AF"} fontSize="9px" fontWeight="700">{h.city}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ width: "100%", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
              Click on a pulsating red hotspot marker on the radar scope to view localized trends.
            </div>
          </Card>

          {/* Hotspot details card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card style={{ padding: "24px", borderLeft: "4px solid var(--danger)", minHeight: "260px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase" }}>Hotspot Report: {selectedHotspot.city}</span>
                <Badge tone="danger">ANONYMOUS DATA</Badge>
              </div>

              <h2 style={{ fontSize: "22px", margin: "10px 0 2px" }}>{selectedHotspot.scamType}</h2>
              <div style={{ fontSize: "14px", display: "flex", gap: "10px", color: "var(--text-muted)" }}>
                <span>Trend: <strong style={{ color: "var(--danger)" }}>{selectedHotspot.trend}</strong></span>
                <span>•</span>
                <span>Active Reports: <strong>{selectedHotspot.reports}</strong></span>
              </div>

              <div style={{ marginTop: "16px", background: "var(--surface-2)", padding: "12px", borderRadius: "8px" }}>
                <strong style={{ fontSize: "12.5px", color: "var(--warning)", textTransform: "uppercase" }}>Common Tactics:</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--text)", lineHeight: 1.45 }}>{selectedHotspot.tactics}</p>
              </div>

              <div style={{ marginTop: "14px" }}>
                <strong style={{ fontSize: "12.5px", color: "var(--safe-strong)", textTransform: "uppercase" }}>Safety Advice:</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--text)", lineHeight: 1.45 }}>{selectedHotspot.recommendation}</p>
              </div>
            </Card>

            {/* Quick reporting redirect card */}
            <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px" }}>Encountered a similar scam attempt?</h4>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Help update the Scam Radar by logging it.</span>
              </div>
              <Badge tone="info" style={{ cursor: "pointer" }} onClick={() => goTo && goTo("report")}>Report Scam</Badge>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Trend Analytics Charts */}
      {activeTab === "charts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="ss-grid-2" style={{ gap: "24px" }}>
            
            {/* Chart 1: Reports over time */}
            <Card style={{ padding: "20px" }}>
              <div className="ss-card-title" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <Activity size={14} className="ss-icon-accent" /> Cumulative Reports Trend
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={REPORTS_OVER_TIME}>
                  <CartesianGrid stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="reports" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>
                Monthly crowd-sourced incident log totals.
              </div>
            </Card>

            {/* Chart 2: Category Distribution */}
            <Card style={{ padding: "20px" }}>
              <div className="ss-card-title" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <PieIcon size={14} className="ss-icon-accent" /> Scam Type Breakdown (%)
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: 8, color: "#ffffff" }} itemStyle={{ color: "#ffffff" }} labelStyle={{ color: "#ffffff" }} />
                  <Legend formatter={(value) => <span style={{ color: "#ffffff", fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Chart 3: Weekly Changes */}
          <Card style={{ padding: "20px" }}>
            <div className="ss-card-title" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <BarChart2 size={14} className="ss-icon-accent" /> Weekly Rate of Change (%)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={WEEKLY_TRENDS}>
                <CartesianGrid stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: 8, color: "#ffffff" }} itemStyle={{ color: "#ffffff" }} labelStyle={{ color: "#ffffff" }} />
                <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                  {WEEKLY_TRENDS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.change > 0 ? "var(--danger)" : "var(--safe-strong)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>
              Weekly increase or decrease in report counts across category vectors.
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Campaign Clusters */}
      {activeTab === "campaigns" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Main clustering graph card */}
          <Card style={{ padding: "24px" }}>
            <div style={{ borderBottom: "1px solid var(--surface-border)", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", margin: 0, display: "flex", gap: "6px", alignItems: "center" }}>
                <Layers size={16} className="ss-icon-accent" /> Semantic Campaign Clustering
              </h3>
              <span className="ss-badge" style={{ background: "rgba(245,158,11,0.15)", color: "var(--warning)", border: "1.5px dashed var(--warning)" }}>
                Potential campaign pattern requiring verification
              </span>
            </div>

            <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              This engine aggregates anonymized descriptions. If similar combinations of authority claims, payment requests, and communication patterns are logged within a short timeframe, it flags them as a potential scam campaign.
            </p>

            {/* Clustering SVG nodes diagram */}
            <div style={{ display: "flex", justifyContent: "center", background: "var(--surface-2)", borderRadius: "12px", padding: "26px", border: "1px solid var(--surface-border)" }}>
              <svg width="400" height="180">
                {/* Node connections */}
                <line x1="80" y1="40" x2="200" y2="90" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="80" y1="90" x2="200" y2="90" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="80" y1="140" x2="200" y2="90" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="200" y1="90" x2="320" y2="90" stroke="var(--danger)" strokeWidth="2" />

                {/* Report A */}
                <circle cx="80" cy="40" r="18" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
                <text x="80" y="44" fill="white" fontSize="9px" fontWeight="700" textAnchor="middle">REP A</text>
                
                {/* Report B */}
                <circle cx="80" cy="90" r="18" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
                <text x="80" y="94" fill="white" fontSize="9px" fontWeight="700" textAnchor="middle">REP B</text>

                {/* Report C */}
                <circle cx="80" cy="140" r="18" fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
                <text x="80" y="144" fill="white" fontSize="9px" fontWeight="700" textAnchor="middle">REP C</text>

                {/* Merged Pattern Node */}
                <circle cx="200" cy="90" r="24" fill="rgba(245, 158, 11, 0.15)" stroke="var(--warning)" strokeWidth="2" />
                <text x="200" y="93" fill="var(--warning)" fontSize="8.5px" fontWeight="800" textAnchor="middle">PATTERN</text>
                <text x="200" y="103" fill="var(--warning)" fontSize="7px" fontWeight="600" textAnchor="middle">DETECTED</text>

                {/* Output campaign node */}
                <circle cx="320" cy="90" r="28" fill="rgba(239, 68, 68, 0.15)" stroke="var(--danger)" strokeWidth="2" style={{ animation: "pulse-radar 2.5s infinite" }} />
                <text x="320" y="93" fill="var(--danger)" fontSize="8px" fontWeight="800" textAnchor="middle">CAMPAIGN</text>
                <text x="320" y="103" fill="var(--danger)" fontSize="7px" fontWeight="600" textAnchor="middle">#24A-DEL</text>
              </svg>
            </div>

            {/* Campaign analytics metrics details */}
            <div style={{ marginTop: "18px", padding: "16px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "10px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", color: "var(--danger)", fontWeight: "700", fontSize: "14.5px" }}>
                <ShieldAlert size={16} /> 12 demo reports contain similar courier + police impersonation patterns.
              </div>
              <p style={{ margin: "8px 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45 }}>
                <strong>Verification Alert Note:</strong> This clustering diagram highlights potential correlation indicators (matching Courier custom holds combined with Skype police video trials) and is meant for prototype demonstration. It does not constitute legal proof of criminal coordination.
              </p>
            </div>
          </Card>
        </div>
      )}
      
      {/* CSS animations for spin and radar pulses */}
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-radar {
          0% {
            r: 5px;
            opacity: 1;
            stroke-width: 3px;
          }
          100% {
            r: 28px;
            opacity: 0;
            stroke-width: 0.5px;
          }
        }
      `}</style>
    </div>
  );
}
