import React, { useState, useMemo } from "react";
import {
  ShieldCheck, ShieldAlert, TrendingUp, Info, CheckCircle2, AlertTriangle, Clock, GraduationCap,
  MessageSquare, PhoneCall, QrCode, HelpCircle, Phone, Users, ArrowLeft, Lock
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
  TRENDING_SCAMS,
  SAFETY_CIRCLE_SEED
} from "../services/scamEngine";

const CURRENT_USER = {
  name: "Manjeet Yadav",
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
  setGuardianMode,
  goTo,
  events,
  missions,
  onStartMission,
  xp = 0,
  streak = 3,
  badges = []
}) {
  // Guardian Sub-view States: 'home' | 'wizard' | 'payment' | 'help'
  const [viewState, setViewState] = useState("home");

  // Wizard States
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState([]);

  // Payment Checklist States
  const [payAccidental, setPayAccidental] = useState(false);
  const [payScanQr, setPayScanQr] = useState(false);
  const [payEnterPin, setPayEnterPin] = useState(false);

  // Load Safety Circle
  const safetyCircle = useMemo(() => {
    try {
      const saved = localStorage.getItem("ss:safety-circle");
      return saved ? JSON.parse(saved) : SAFETY_CIRCLE_SEED;
    } catch (err) {
      return SAFETY_CIRCLE_SEED;
    }
  }, []);

  const radarData = Object.entries(components).map(([key, d]) => ({
    subject: COMPONENT_LABELS[key].split(" ")[0],
    value: d.value,
    full: 100,
  }));
  const { strengths, weaknesses } = getExplainability(components);
  
  const chartData = [...SCORE_HISTORY.slice(0, -1), { month: "Jul", score }];
  const scoreDelta = score - SCORE_HISTORY[0].score;
  const thisMonthDelta = score - SCORE_HISTORY[SCORE_HISTORY.length - 2].score;
  const recentEvents = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  // Wizard Logic
  const WIZARD_QUESTIONS = [
    { text: "Do you personally know the person asking for money?", detail: "E.g. Is it your son, daughter, relative, or close friend?" },
    { text: "Did they contact you unexpectedly (out of the blue)?", detail: "E.g. An unexpected call from a new number, customs alert, or SMS warning." },
    { text: "Are they threatening you with arrest, CBI charges, or account freeze?", detail: "Real authorities (like CBI, police, TRAI) never make threats over a call." },
    { text: "Are they demanding that you keep this conversation secret?", detail: "Scammers try to isolate you so you don't talk to family members or get help." },
    { text: "Are they asking you to share an OTP code, password, or type your UPI PIN?", detail: "Fatal sign: You NEVER need a PIN or OTP to receive money." }
  ];

  const handleWizardAnswer = (isYes) => {
    const nextAnswers = [...wizardAnswers, isYes];
    setWizardAnswers(nextAnswers);
    if (wizardStep < WIZARD_QUESTIONS.length - 1) {
      setWizardStep(wizardStep + 1);
    } else {
      setWizardStep(WIZARD_QUESTIONS.length); // Finished step
    }
  };

  const resetWizard = () => {
    setWizardStep(0);
    setWizardAnswers([]);
  };

  const getWizardRecommendation = () => {
    const [knowsPerson, isUnexpected, hasThreats, hasSecrecy, hasPinRequest] = wizardAnswers;

    if (hasPinRequest) {
      return {
        level: "critical",
        title: "STOP — Never share OTPs or UPI PINs!",
        desc: "This is a direct financial theft attempt. Legitimate senders or banking institutions NEVER need your UPI PIN, card password, or OTP code to refund or transfer money to you. Do not send anything."
      };
    }
    if (hasThreats || hasSecrecy) {
      return {
        level: "critical",
        title: "STOP — This is a Scam (Coercion / Digital Arrest)",
        desc: "This matches the 'Digital Arrest' and courier scam tactics. Government agencies, customs departments, and police NEVER interrogate people over WhatsApp or video calls, and they never freeze your accounts without physical legal processes. Terminate communication."
      };
    }
    if (isUnexpected && !knowsPerson) {
      return {
        level: "warning",
        title: "WARNING — Highly Suspicious Request",
        desc: "An unexpected contact from a stranger demanding money is almost certainly a scam. Do not transfer funds, do not install any screen-sharing software, and call a family member immediately."
      };
    }
    if (isUnexpected && knowsPerson) {
      return {
        level: "warning",
        title: "CAUTION — Verify Identity Separately",
        desc: "Even if they claim to be a friend or family member, their voice or messaging account could be hacked or cloned (AI voice cloning). Hang up and call them back directly on their known, saved phone number."
      };
    }
    return {
      level: "safe",
      title: "Verify Manually",
      desc: "Always be careful with payments. Ensure you call the contact directly or discuss with a family member before transferring any money."
    };
  };

  // ---- Guardian UI Render ----
  if (guardianMode) {
    return (
      <div className="ss-page" style={{ animation: "fadeIn 0.3s ease" }}>
        
        {/* Sub-view: Home Dashboard */}
        {viewState === "home" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "10px", marginBottom: "6px" }}>
              <div>
                <span className="ss-eyebrow" style={{ fontSize: "14px" }}>ScamShield AI · Easy Mode</span>
                <h1 style={{ margin: "2px 0 0" }}>Hello, {CURRENT_USER.name}</h1>
              </div>
              <button 
                className="ss-btn-secondary" 
                style={{ width: "auto", margin: 0, padding: "8px 14px", display: "flex", gap: "6px", alignItems: "center" }}
                onClick={() => setGuardianMode(false)}
              >
                Advanced Dashboard
              </button>
            </div>

            {/* Current Safety Status banner */}
            <Card style={{ background: "rgba(34, 197, 94, 0.08)", border: "2.5px solid var(--safe-strong)", borderRadius: "18px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
              <ShieldCheck size={48} color="var(--safe-strong)" style={{ flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: "20px", color: "var(--safe-strong)", margin: 0 }}>You’re protected</h2>
                <p style={{ margin: "4px 0 0", fontSize: "15.5px", color: "var(--text)" }}>ScamShield AI is running. No immediate action is needed.</p>
              </div>
            </Card>

            {/* Four primary actions grid */}
            <div className="ss-grid-2" style={{ gap: "20px", marginTop: "10px" }}>
              {/* CHECK A MESSAGE */}
              <button 
                className="ss-card" 
                onClick={() => goTo("scanner")}
                style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", textAlign: "left", cursor: "pointer", border: "1px solid var(--surface-border)", background: "var(--surface)", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "12px", padding: "12px" }}>
                    <MessageSquare size={28} color="var(--accent-strong)" />
                  </div>
                  <h3 style={{ fontSize: "18px", margin: 0, color: "white" }}>CHECK A MESSAGE</h3>
                </div>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Received an SMS, email, or WhatsApp message? Paste it here to verify if it is safe.</p>
              </button>

              {/* CHECK A CALL */}
              <button 
                className="ss-card" 
                onClick={() => { resetWizard(); setViewState("wizard"); }}
                style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", textAlign: "left", cursor: "pointer", border: "1px solid var(--surface-border)", background: "var(--surface)", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "12px", padding: "12px" }}>
                    <PhoneCall size={28} color="var(--warning)" />
                  </div>
                  <h3 style={{ fontSize: "18px", margin: 0, color: "white" }}>CHECK A CALL</h3>
                </div>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Someone is calling you or asking you for money? Check what you should do.</p>
              </button>

              {/* CHECK A PAYMENT */}
              <button 
                className="ss-card" 
                onClick={() => setViewState("payment")}
                style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", textAlign: "left", cursor: "pointer", border: "1px solid var(--surface-border)", background: "var(--surface)", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "12px" }}>
                    <QrCode size={28} color="var(--safe-strong)" />
                  </div>
                  <h3 style={{ fontSize: "18px", margin: 0, color: "white" }}>CHECK A PAYMENT</h3>
                </div>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Verify refund requests or QR codes. Check rules before sending money.</p>
              </button>

              {/* ASK FOR HELP */}
              <button 
                className="ss-card" 
                onClick={() => setViewState("help")}
                style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", textAlign: "left", cursor: "pointer", border: "1px solid var(--surface-border)", background: "var(--surface)", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "12px", padding: "12px" }}>
                    <HelpCircle size={28} color="#A78BFA" />
                  </div>
                  <h3 style={{ fontSize: "18px", margin: 0, color: "white" }}>ASK FOR HELP</h3>
                </div>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Quick links to call your family members or contact official helpline agencies.</p>
              </button>
            </div>
          </>
        )}

        {/* Sub-view: Emergency decision assistant wizard */}
        {viewState === "wizard" && (
          <Card style={{ padding: "26px" }}>
            <button className="ss-link-btn" onClick={() => setViewState("home")} style={{ marginBottom: "14px" }}>
              <ArrowLeft size={16} /> Back to Easy Home
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <PhoneCall className="ss-icon-warning" size={24} />
              <h2 style={{ fontSize: "22px", margin: 0 }}>Someone is asking me for money</h2>
            </div>

            {wizardStep < WIZARD_QUESTIONS.length ? (
              // Question screen
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ background: "var(--surface-2)", borderRadius: "10px", padding: "10px 14px", fontSize: "12.5px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  QUESTION {wizardStep + 1} OF {WIZARD_QUESTIONS.length}
                  <div style={{ height: "4px", background: "var(--surface-border)", borderRadius: "2px", overflow: "hidden", marginTop: "6px" }}>
                    <div style={{ height: "100%", width: `${((wizardStep + 1) / WIZARD_QUESTIONS.length) * 100}%`, background: "var(--warning)" }} />
                  </div>
                </div>

                <div style={{ minHeight: "90px" }}>
                  <h3 style={{ fontSize: "20px", color: "var(--text)" }}>{WIZARD_QUESTIONS[wizardStep].text}</h3>
                  <p style={{ fontSize: "14.5px", color: "var(--text-muted)", marginTop: "6px" }}>{WIZARD_QUESTIONS[wizardStep].detail}</p>
                </div>

                {/* YES / NO Choices */}
                <div style={{ display: "flex", gap: "16px" }}>
                  <button 
                    className="ss-btn-primary" 
                    style={{ flex: 1, padding: "18px", fontSize: "18px", background: "var(--accent)" }}
                    onClick={() => handleWizardAnswer(true)}
                  >
                    YES
                  </button>
                  <button 
                    className="ss-btn-secondary" 
                    style={{ flex: 1, padding: "18px", fontSize: "18px", borderColor: "var(--surface-border)" }}
                    onClick={() => handleWizardAnswer(false)}
                  >
                    NO
                  </button>
                </div>
              </div>
            ) : (
              // Results debrief screen
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {(() => {
                  const rec = getWizardRecommendation();
                  const isCritical = rec.level === "critical";
                  const isWarning = rec.level === "warning";
                  
                  return (
                    <>
                      <div 
                        style={{ 
                          background: isCritical ? "rgba(239,68,68,0.12)" : isWarning ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)", 
                          border: `2px solid ${isCritical ? "var(--danger)" : isWarning ? "var(--warning)" : "var(--safe-strong)"}`, 
                          borderRadius: "14px", 
                          padding: "20px" 
                        }}
                      >
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {isCritical ? <ShieldAlert size={28} color="var(--danger)" /> : isWarning ? <AlertTriangle size={28} color="var(--warning)" /> : <ShieldCheck size={28} color="var(--safe-strong)" />}
                          <h3 style={{ fontSize: "20px", color: isCritical ? "var(--danger)" : isWarning ? "var(--warning)" : "var(--safe-strong)", margin: 0 }}>
                            {rec.title}
                          </h3>
                        </div>
                        <p style={{ margin: "10px 0 0", color: "var(--text)", fontSize: "15.5px", lineHeight: "1.55" }}>
                          {rec.desc}
                        </p>
                      </div>

                      {/* Primary Actions panel */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h4 style={{ margin: 0, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Recommended Actions</h4>
                        
                        {isCritical && (
                          <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid var(--danger)", borderRadius: "10px", padding: "14px", display: "flex", gap: "10px", alignItems: "center", color: "white", fontSize: "16px", fontWeight: "700" }}>
                            🚫 HANG UP IMMEDIATELY. DO NOT SHARE ANY DATA.
                          </div>
                        )}

                        {/* Family Contacts call shortcut */}
                        {safetyCircle.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Call family to check:</span>
                            {safetyCircle.slice(0, 2).map(m => (
                              <a 
                                key={m.id} 
                                href={`tel:${m.phone}`}
                                className="ss-btn-secondary"
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", margin: 0 }}
                              >
                                <span style={{ display: "flex", gap: "8px", alignItems: "center" }}><Phone size={14} /> Call {m.name} ({m.relation})</span>
                                <span>{m.phone}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <button className="ss-btn-secondary" onClick={() => goTo("circle")}>
                            Go to Safety Circle and Add Family Contacts
                          </button>
                        )}

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <a href="tel:1930" className="ss-btn-primary" style={{ flex: 1, background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none" }}>
                            <Phone size={14} /> Call Government (1930)
                          </a>
                          <button className="ss-btn-secondary" onClick={() => goTo("coach")} style={{ flex: 1, margin: 0 }}>
                            Ask ScamShield Coach
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <button className="ss-btn-secondary" onClick={resetWizard} style={{ marginTop: "10px" }}>
                  Start Over / Check Another
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Sub-view: CHECK A PAYMENT */}
        {viewState === "payment" && (
          <Card style={{ padding: "26px" }}>
            <button className="ss-link-btn" onClick={() => setViewState("home")} style={{ marginBottom: "14px" }}>
              <ArrowLeft size={16} /> Back to Easy Home
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <QrCode className="ss-icon-safe" size={24} />
              <h2 style={{ fontSize: "22px", margin: 0 }}>Check a Payment Request</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Golden rules box */}
              <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px dashed var(--accent-strong)", borderRadius: "12px", padding: "16px" }}>
                <h3 style={{ fontSize: "16px", color: "var(--accent-strong)", margin: "0 0 10px", display: "flex", gap: "6px", alignItems: "center" }}><Lock size={15} /> Payment Safety Rules</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14.5px" }}>
                  <li><strong>UPI PIN entry always SENDS money.</strong> You NEVER need to type your PIN to receive a payment or refund.</li>
                  <li><strong>Never scan a QR code</strong> shown by someone who claims they are paying you. QR codes are only for paying others.</li>
                </ul>
              </div>

              {/* Interactive checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px", background: "var(--surface-2)", borderRadius: "10px" }}>
                <strong style={{ fontSize: "13px", color: "var(--text-muted)" }}>Check the warning signals:</strong>
                
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14.5px" }}>
                  <input type="checkbox" checked={payAccidental} onChange={(e) => setPayAccidental(e.target.checked)} style={{ width: "20px", height: "20px" }} />
                  They claim they "accidentally" overpaid you and demand money back.
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14.5px" }}>
                  <input type="checkbox" checked={payScanQr} onChange={(e) => setPayScanQr(e.target.checked)} style={{ width: "20px", height: "20px" }} />
                  They sent you a QR code to scan to "claim" your refund.
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14.5px" }}>
                  <input type="checkbox" checked={payEnterPin} onChange={(e) => setPayEnterPin(e.target.checked)} style={{ width: "20px", height: "20px" }} />
                  They want you to enter your UPI PIN inside a GPay/PhonePe screen.
                </label>
              </div>

              {(payAccidental || payScanQr || payEnterPin) && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "2px solid var(--danger)", borderRadius: "10px", padding: "14px", display: "flex", gap: "8px", alignItems: "center", color: "white", fontSize: "15px", fontWeight: "700" }}>
                  ⚠️ DANGER WARNING: This is a scam pattern! Stop communicating and do not transfer money or enter your PIN.
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {safetyCircle.length > 0 ? (
                  <a href={`tel:${safetyCircle[0].phone}`} className="ss-btn-secondary" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", textDecoration: "none", margin: 0 }}>
                    <Phone size={14} /> Call {safetyCircle[0].name} ({safetyCircle[0].relation})
                  </a>
                ) : (
                  <button className="ss-btn-secondary" onClick={() => goTo("circle")} style={{ flex: 1, margin: 0 }}>
                    Add Trusted Family Contacts
                  </button>
                )}
                <button className="ss-btn-primary" onClick={() => goTo("coach")} style={{ flex: 1 }}>
                  Ask Scam Coach
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Sub-view: ASK FOR HELP */}
        {viewState === "help" && (
          <Card style={{ padding: "26px" }}>
            <button className="ss-link-btn" onClick={() => setViewState("home")} style={{ marginBottom: "14px" }}>
              <ArrowLeft size={16} /> Back to Easy Home
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Users className="ss-icon-accent" size={24} />
              <h2 style={{ fontSize: "22px", margin: 0 }}>Get Help & Verify</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Safety Circle Trusted List */}
              <div>
                <h3 style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "8px" }}>Trusted Family Contacts</h3>
                {safetyCircle.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {safetyCircle.map(m => (
                      <div 
                        key={m.id} 
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px" }}
                      >
                        <div>
                          <strong style={{ fontSize: "15px" }}>{m.name}</strong>
                          <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{m.relation}</div>
                        </div>
                        <a 
                          href={`tel:${m.phone}`}
                          className="ss-btn-primary"
                          style={{ padding: "8px 14px", minHeight: "auto", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", textDecoration: "none" }}
                        >
                          <Phone size={13} /> Call
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "14px", textAlign: "center", background: "var(--surface-2)", border: "1.5px dashed var(--surface-border)", borderRadius: "10px" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 10px" }}>You haven't added family members to your trusted list yet.</p>
                    <button className="ss-btn-secondary" onClick={() => goTo("circle")} style={{ width: "auto", margin: 0 }}>Set Up Family Contacts</button>
                  </div>
                )}
              </div>

              {/* Official helplines */}
              <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "16px" }}>
                <h3 style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "8px" }}>Official Government Helplines</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ fontSize: "15px" }}>National Cyber Crime Helpline</strong>
                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Call to report financial cyber fraud immediately</div>
                    </div>
                    <a 
                      href="tel:1930"
                      className="ss-btn-primary"
                      style={{ padding: "8px 14px", minHeight: "auto", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center", textDecoration: "none", background: "var(--danger)" }}
                    >
                      <Phone size={13} /> Call 1930
                    </a>
                  </div>
                </div>
              </div>

              {/* AI Coach Link */}
              <button 
                className="ss-btn-secondary" 
                onClick={() => goTo("coach")}
                style={{ width: "100%", margin: 0, padding: "14px" }}
              >
                Ask ScamShield AI Chatbot for Advice
              </button>
            </div>
          </Card>
        )}

      </div>
    );
  }

  // ---- Advanced Dashboard UI (Original) ----
  return (
    <div className="ss-page">
      


      <div className="ss-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="ss-eyebrow">Good {CURRENT_USER.timeOfDay()}</div>
            <h1>{CURRENT_USER.name}</h1>
            <p className="ss-hero-sub" style={{ margin: "2px 0 0" }}>Here's where your scam preparedness stands today.</p>
          </div>
          
          {/* Gamification badge blocks */}
          {!guardianMode && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <span>🔥</span>
                <span><strong>{streak} Days</strong> Streak</span>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <span>⭐</span>
                <span><strong>{xp} XP</strong> Earned</span>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <span>🏅</span>
                <span><strong>{badges.length}</strong> Badges</span>
              </div>
            </div>
          )}
        </div>
        {guardianMode && (
          <div className="ss-guardian-banner" style={{ width: "100%", marginTop: "12px" }}>
            <ShieldAlert size={16} />
            Guardian Mode active — monitoring linked accounts in your Safety Circle
          </div>
        )}
      </div>

      {/* Weekly Safety Insight Card */}
      {!guardianMode && (
        <Card style={{ background: "rgba(16, 185, 129, 0.05)", border: "1.5px solid rgba(16, 185, 129, 0.25)", display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", marginBottom: "16px" }}>
          <TrendingUp size={24} color="var(--safe-strong)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: "14.5px", color: "var(--safe-strong)", display: "block" }}>Weekly Safety Insight</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              This week your Payment Safety improved by 8 points. You are now better at identifying QR-based payment scams.
            </p>
          </div>
        </Card>
      )}

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
