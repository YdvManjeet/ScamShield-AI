import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ScanLine, ImagePlus, Link2, CreditCard, Phone, QrCode, Upload, Trash2,
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Info, HelpCircle,
  BookmarkPlus, MessageCircleQuestion, Flag, FlaskConical, ChevronRight, Eye, XCircle,
  Volume2, ShieldAlert, X
} from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import SectionHeading from "../components/SectionHeading";
import { runScamAnalysis, analyzeUrlHeuristics, getDemoExtraction, SAFETY_CIRCLE_SEED } from "../services/scamEngine";
import { ollamaService } from "../services/ollama";

const VERDICT_ICON = { safe: ShieldCheck, info: Info, warning: AlertTriangle, danger: XCircle };

// Speech synthesis checker
const isSpeechAvailable = typeof window !== "undefined" && window.speechSynthesis;

function AnalysisProgress({ onDone, steps }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const analysisSteps = steps || [
    "Checking authority claims...",
    "Detecting urgency and coercion...",
    "Checking payment manipulation patterns...",
    "Analyzing known scam language...",
    "Evaluating isolation tactics...",
  ];

  useEffect(() => {
    if (visibleCount >= analysisSteps.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 380);
    return () => clearTimeout(t);
  }, [visibleCount, analysisSteps.length]);

  return (
    <Card style={{ marginTop: "12px" }}>
      <div className="ss-analysis-steps">
        {analysisSteps.slice(0, visibleCount).map((s, i) => (
          <div key={i} className={`ss-analysis-step ${i === visibleCount - 1 ? "active" : "done"}`}>
            {i === visibleCount - 1 ? <span className="ss-spinner" /> : <CheckCircle2 size={14} className="ss-icon-safe" />}
            {s}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScanResultPanel({ result, savedAlready, onSave, onAskCoach, onGoReport, onGoSimulation, guardianMode }) {
  if (!result || result.riskLevel === "empty") return null;
  const VerdictIcon = VERDICT_ICON[result.tone] || Info;
  const hasEntities = result.entities && (result.entities.phones?.length || result.entities.amounts?.length || result.entities.urls?.length);
  const isAiEnhanced = !!result.aiResult;

  const [explainMore, setExplainMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [copiedToast, setCopiedToast] = useState(null);

  // Load Safety Circle
  const safetyCircle = useMemo(() => {
    try {
      const saved = localStorage.getItem("ss:safety-circle");
      return saved ? JSON.parse(saved) : SAFETY_CIRCLE_SEED;
    } catch (err) {
      return SAFETY_CIRCLE_SEED;
    }
  }, []);

  // Simplified Text Translation Function
  const getSimplifiedExplanation = () => {
    const text = (result.explanation || "").toLowerCase();
    const type = (result.scamType || "").toLowerCase();
    
    if (type.includes("digital arrest") || text.includes("cbi") || text.includes("arrest") || text.includes("police") || text.includes("narcotics")) {
      return "They are pretending to be a police or government official and trying to scare you into acting quickly.";
    }
    if (type.includes("upi") || type.includes("payment") || text.includes("upi pin") || text.includes("qr code") || text.includes("refund")) {
      return "They are claiming to refund you money but are actually trying to steal your banking PIN to empty your account.";
    }
    if (type.includes("kyc") || type.includes("otp") || text.includes("otp") || text.includes("suspend") || text.includes("block")) {
      return "They are pretending to be from your bank and are trying to steal your SMS code (OTP) to log into your account.";
    }
    if (type.includes("emergency") || text.includes("accident") || text.includes("emergency") || text.includes("voice")) {
      return "They are trying to play on your family emotions by claiming a relative is in trouble and needs urgent cash.";
    }
    if (type.includes("investment") || text.includes("profit") || text.includes("guaranteed") || text.includes("sebi")) {
      return "They are promising you fake daily profits or jobs and asking you to pay money upfront to register.";
    }
    return "They are using artificial fear or urgency to get you to act before you have time to think.";
  };

  const handleSpeak = (langCode) => {
    if (!isSpeechAvailable) return;
    window.speechSynthesis.cancel();
    
    let speakText = "";
    if (langCode === "hi") {
      speakText = "चेतावनी। यह एक घोटाला हो सकता है। कृपया ध्यान दें: किसी को पैसे न भेजें। अपना ओटीपी साझा न करें। अपना यूपीआई पिन दर्ज न करें। स्क्रीन शेयर करने वाला ऐप इंस्टॉल न करें। कॉल तुरंत काट दें।";
    } else {
      speakText = "Warning. This may be a scam. Please remember: Do not send money. Do not share your OTP code. Do not enter your UPI PIN. Do not install any screen sharing apps. Hang up the call immediately.";
    }
    
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = langCode === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Generate customized alert text dynamically
  const getAlertText = () => {
    const org = result.scamType && result.scamType !== "No specific pattern matched"
      ? result.scamType
      : "an unknown source";
    return `ScamShield Safety Alert\n\nI received a suspicious communication claiming to be from ${org}.\n\nScamShield detected high-risk scam indicators.\n\nI have not intentionally shared any banking credentials through ScamShield.\n\nPlease contact me directly to help verify this.`;
  };

  const handleCopyAlert = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedToast("Alert copied to clipboard!");
        setTimeout(() => setCopiedToast(null), 2500);
      })
      .catch(() => {
        setCopiedToast("Failed to copy alert");
        setTimeout(() => setCopiedToast(null), 2500);
      });
  };

  const handleShareAlert = (text) => {
    if (navigator.share) {
      navigator.share({
        title: "ScamShield Safety Alert",
        text: text
      }).catch((err) => console.log("Share failed:", err));
    } else {
      handleCopyAlert(text);
    }
  };

  const isHighRisk = result.riskScore >= 45;

  const renderModal = () => {
    if (!showModal) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <Card style={{ maxWidth: "480px", width: "100%", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", display: "flex", gap: "6px", alignItems: "center" }}>
              <ShieldAlert size={16} color="var(--warning)" /> Contact Safety Circle
            </h3>
            <button onClick={() => { setShowModal(false); setSelectedContact(null); }} style={{ background: "none", border: "none", color: "var(--text)" }}>
              <X size={18} />
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.45 }}>
            "Scammers isolate. ScamShield reconnects. Before taking any financial action, verify this call or message with someone you trust."
          </p>

          {safetyCircle.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {safetyCircle.map(m => (
                <div 
                  key={m.id}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "14.5px" }}>{m.name}</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>({m.relation})</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--accent-strong)" }}>{m.prefMethod.toUpperCase()} preferred</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <a 
                      href={`tel:${m.phone}`}
                      className="ss-btn-secondary"
                      style={{ flex: 1, margin: 0, padding: "8px", fontSize: "12.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none" }}
                    >
                      <Phone size={12} /> Call
                    </a>
                    <button 
                      className="ss-btn-primary"
                      style={{ flex: 1, margin: 0, padding: "8px", fontSize: "12.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                      onClick={() => setSelectedContact(m)}
                    >
                      <Share2 size={12} /> Share Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "14px", textAlign: "center", background: "var(--surface-2)", border: "1px dashed var(--surface-border)", borderRadius: "8px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 10px" }}>You haven't added anyone to your Safety Circle yet.</p>
            </div>
          )}

          {copiedToast && (
            <div style={{ background: "var(--safe-strong)", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12.5px", textAlign: "center", fontWeight: "600" }}>
              {copiedToast}
            </div>
          )}

          {/* Sub-card to copy/share text alert for the selected contact */}
          {selectedContact && (
            <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "12.5px", color: "var(--accent-strong)" }}>Alert message to {selectedContact.name}:</strong>
                <button onClick={() => setSelectedContact(null)} style={{ background: "none", border: "none", color: "var(--text-muted)" }}><X size={14} /></button>
              </div>

              <textarea 
                className="ss-textarea" 
                rows={7} 
                style={{ fontSize: "12.5px" }} 
                readOnly 
                value={getAlertText()} 
              />

              <div style={{ display: "flex", gap: "6px" }}>
                <button 
                  className="ss-btn-secondary" 
                  style={{ flex: 1, margin: 0, padding: "6px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  onClick={() => handleCopyAlert(getAlertText())}
                >
                  Copy Text
                </button>
                <button 
                  className="ss-btn-secondary" 
                  style={{ flex: 1, margin: 0, padding: "6px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  onClick={() => handleShareAlert(getAlertText())}
                >
                  <Share2 size={11} /> Share Alert
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ---- Guardian Mode Result Panel View ----
  if (guardianMode) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
          
          {isHighRisk ? (
            // Flashing High Risk Danger Warnings
            <div 
              style={{ 
                background: "rgba(239, 68, 68, 0.12)", 
                border: "4px solid var(--danger)", 
                borderRadius: "18px", 
                padding: "22px 24px", 
                animation: "pulse 2s infinite" 
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)" }}>
                <ShieldAlert size={36} />
                <h2 style={{ fontSize: "30px", fontWeight: "800", margin: 0 }}>STOP! This may be a scam.</h2>
              </div>
              
              <p style={{ fontSize: "16px", color: "white", marginTop: "12px", fontWeight: "600" }}>
                {getSimplifiedExplanation()}
              </p>

              <div style={{ marginTop: "18px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(239,68,68,0.25)" }}>
                <strong style={{ fontSize: "15px", color: "#FCA5A5", textTransform: "uppercase", letterSpacing: "0.05em" }}>DO NOT PERFORM THESE ACTIONS:</strong>
                <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "15.5px", color: "#FEE2E2", marginTop: "8px", margin: "8px 0 0 0" }}>
                  <li>❌ <strong>DO NOT send any money</strong> or registration fees.</li>
                  <li>❌ <strong>DO NOT share your OTP</strong> verification code.</li>
                  <li>❌ <strong>DO NOT enter your UPI PIN</strong> (PIN is only for sending money, never receiving).</li>
                  <li>❌ <strong>DO NOT install screen sharing apps</strong> (like Skype or AnyDesk).</li>
                  <li>❌ <strong>DO NOT stay on the call.</strong> Hang up immediately.</li>
                </ul>
              </div>

              {/* TTS Aloud buttons */}
              {isSpeechAvailable && (
                <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#D1D5DB" }}>🔊 Hear Advice:</span>
                  <button 
                    className="ss-btn-secondary" 
                    style={{ padding: "6px 12px", minHeight: "auto", margin: 0, width: "auto", fontSize: "12.5px" }}
                    onClick={() => handleSpeak("en")}
                  >
                    Read Aloud (English)
                  </button>
                  <button 
                    className="ss-btn-secondary" 
                    style={{ padding: "6px 12px", minHeight: "auto", margin: 0, width: "auto", fontSize: "12.5px" }}
                    onClick={() => handleSpeak("hi")}
                  >
                    सुनें (हिंदी)
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Safe / Caution Warning
            <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "3px solid var(--safe-strong)", borderRadius: "18px", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--safe-strong)" }}>
                <ShieldCheck size={36} />
                <h2 style={{ fontSize: "26px", fontWeight: "700", margin: 0 }}>Looks Safe</h2>
              </div>
              <p style={{ fontSize: "16px", color: "white", marginTop: "8px" }}>
                No major scam patterns were found in this text. However, always stay cautious. Never share OTPs or enter your UPI PIN for strangers.
              </p>
            </div>
          )}

          {/* Explain More Collapsible details */}
          <Card style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14.5px", color: "var(--text-muted)" }}>Technical Scan Diagnostics</span>
              <button 
                className="ss-btn-secondary" 
                style={{ width: "auto", margin: 0, padding: "6px 12px", fontSize: "12px", minHeight: "auto" }}
                onClick={() => setExplainMore(!explainMore)}
              >
                {explainMore ? "Hide Technical Details" : "Explain More"}
              </button>
            </div>

            {explainMore && (
              <div style={{ marginTop: "14px", borderTop: "1px solid var(--surface-border)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span>Scam Pattern Type:</span>
                  <strong>{result.scamType || "General Check"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span>Risk Score:</span>
                  <strong style={{ color: result.tone === "danger" ? "var(--danger)" : "var(--safe-strong)" }}>{result.riskScore}/100</strong>
                </div>
                {result.detectedSignals?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Triggers Found:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {result.detectedSignals.map((s, i) => <Badge key={i} tone="warning">{s.label}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Verification Advisement card in Guardian Mode */}
          {isHighRisk && (
            <Card style={{ background: "rgba(245, 158, 11, 0.08)", border: "2px dashed var(--warning)", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong style={{ fontSize: "15px", color: "var(--warning)" }}>⚠️ Independent Verification Advised</strong>
                <p style={{ margin: "4px 0 0", fontSize: "14.5px", color: "var(--text)" }}>Before taking any financial action, consider contacting someone you trust.</p>
              </div>
              <button className="ss-btn-primary" onClick={() => setShowModal(true)} style={{ width: "100%", background: "var(--warning)", color: "black", fontSize: "16px", fontWeight: "700" }}>
                Contact Safety Circle
              </button>
            </Card>
          )}

          {/* Action Panel */}
          <Card style={{ padding: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <a href="tel:1930" className="ss-btn-primary" style={{ flex: 1, background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none" }}>
                  📞 Call Helpline (1930)
                </a>
                <button className="ss-btn-secondary" onClick={() => onAskCoach(result)} style={{ flex: 1, margin: 0 }}>
                  Ask Scam Coach
                </button>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="ss-btn-secondary" onClick={onGoSimulation} style={{ flex: 1, margin: 0 }}>
                  Start Practice Scenario
                </button>
                <button className="ss-btn-primary" style={{ flex: 1 }} onClick={() => onSave(result)} disabled={savedAlready}>
                  {savedAlready ? "Saved to History" : "Save this Report"}
                </button>
              </div>
            </div>
          </Card>

        </div>
        {renderModal()}
      </>
    );
  }

  // ---- Advanced Result Panel View (Original) ----
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        <Card className="ss-scan-result">
          <div className="ss-scan-verdict">
            <div>
              <Badge tone={result.tone} icon={VerdictIcon}>{result.riskLabel}</Badge>
              <div className="ss-scan-verdict-text">{result.verdictText}</div>
            </div>
            <div className="ss-risk-score">{result.riskScore}<span>/100 risk</span></div>
          </div>

          {result.scamType && result.scamType !== "No specific pattern matched" && (
            <div className="ss-scan-type"><strong>Likely Pattern:</strong> {result.scamType} <span className="ss-hint">(confidence {result.confidence}%)</span></div>
          )}

          {result.localHeuristicOnly && (
            <div className="ss-heuristic-note"><Info size={13} /> Heuristic scan. Toggle Deep AI Scan for deep semantic validation.</div>
          )}

          {result.detectedSignals?.length > 0 ? (
            <div>
              <div className="ss-card-title" style={{ marginTop: 10 }}>Rule-Based Warning Signs</div>
              <div className="ss-flag-list">
                {result.detectedSignals.map((f) => <div key={f.key} className="ss-flag-item"><AlertTriangle size={13} /> {f.label}</div>)}
              </div>
            </div>
          ) : (
            !isAiEnhanced && <div className="ss-flag-empty">No heuristics triggers hit — check details.</div>
          )}

          {result.explanation && (
            <div className="ss-why-box">
              <div className="ss-card-title"><HelpCircle size={14} /> Analysis Summary</div>
              <p>{result.explanation}</p>
            </div>
          )}

          {result.riskScore >= 21 && result.recommendedActions?.length > 0 && (
            <div className="ss-action-box">
              <div className="ss-card-title">What should I do?</div>
              <ol className="ss-action-list">
                {result.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
              </ol>
            </div>
          )}

          {hasEntities ? (
            <div className="ss-entities">
              {result.entities.phones?.length > 0 && <div><strong>Phone numbers:</strong> {result.entities.phones.join(", ")}</div>}
              {result.entities.amounts?.length > 0 && <div><strong>Amounts:</strong> {result.entities.amounts.join(", ")}</div>}
              {result.entities.urls?.length > 0 && <div><strong>Links:</strong> {result.entities.urls.join(", ")}</div>}
            </div>
          ) : null}
        </Card>

        {/* Ollama Deep AI Scan panel */}
        {isAiEnhanced && (
          <Card className="ss-scan-result" style={{ borderLeft: "4px solid var(--accent)", background: "rgba(59, 130, 246, 0.03)" }}>
            <div className="ss-scan-verdict">
              <div>
                <Badge tone={result.aiResult.riskLevel === "low" ? "safe" : result.aiResult.riskLevel === "caution" ? "info" : result.aiResult.riskLevel === "suspicious" ? "warning" : "danger"} icon={ShieldCheck}>
                  Ollama AI Verdict: {result.aiResult.riskLabel}
                </Badge>
                <div className="ss-scan-verdict-text" style={{ color: "var(--accent-strong)" }}>Semantic LLM verification successful</div>
              </div>
              <div className="ss-risk-score" style={{ color: "var(--accent-strong)" }}>{result.aiResult.riskScore}<span>/100 risk</span></div>
            </div>

            <div className="ss-scan-type">
              <strong>LLM Scam Classification:</strong> {result.aiResult.scamType} <span className="ss-hint">(confidence {result.aiResult.confidence}%)</span>
            </div>

            {result.aiResult.detectedSignals?.length > 0 && (
              <div>
                <div className="ss-card-title" style={{ marginTop: 10 }}>Semantic Indicators Detected</div>
                <div className="ss-flag-list">
                  {result.aiResult.detectedSignals.map((s, i) => (
                    <div key={i} className="ss-flag-item" style={{ color: "var(--accent-strong)" }}><ShieldCheck size={13} /> {s}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="ss-why-box" style={{ background: "var(--surface-2)" }}>
              <div className="ss-card-title" style={{ color: "var(--text)" }}><HelpCircle size={14} /> AI Scam Coach Reasoning</div>
              <p style={{ color: "var(--text)" }}>{result.aiResult.explanation}</p>
            </div>

            {result.aiResult.recommendedActions?.length > 0 && (
              <div className="ss-action-box" style={{ background: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59,130,246,0.2)" }}>
                <div className="ss-card-title" style={{ color: "var(--accent-strong)" }}>AI Safety Roadmap</div>
                <ol className="ss-action-list">
                  {result.aiResult.recommendedActions.map((a, i) => <li key={i} style={{ color: "var(--text)" }}>{a}</li>)}
                </ol>
              </div>
            )}
          </Card>
        )}

        {/* Verification Advisement card in Normal Mode */}
        {isHighRisk && (
          <Card style={{ background: "rgba(245, 158, 11, 0.08)", border: "1.5px dashed var(--warning)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--warning)", fontSize: "14px" }}>⚠️ Independent Verification Advised</div>
              <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--text)" }}>Before taking any financial action, consider contacting someone you trust.</p>
            </div>
            <button className="ss-btn-primary" onClick={() => setShowModal(true)} style={{ width: "auto", margin: 0, padding: "8px 14px", minHeight: "auto", fontSize: "12.5px", background: "var(--warning)", color: "black" }}>
              Contact Safety Circle
            </button>
          </Card>
        )}

        <Card style={{ padding: "14px 20px" }}>
          <div className="ss-scan-actions-row">
            <button className="ss-btn-tertiary" onClick={() => onAskCoach(result)}><MessageCircleQuestion size={14} /> Ask AI Scam Coach</button>
            <button className="ss-btn-tertiary" onClick={() => onGoReport(result)}><Flag size={14} /> Report Scam</button>
            <button className="ss-btn-tertiary" onClick={onGoSimulation}><FlaskConical size={14} /> Start Related Simulation</button>
            <button className="ss-btn-primary ss-btn-tertiary-primary" onClick={() => onSave(result)} disabled={savedAlready}>
              <BookmarkPlus size={14} /> {savedAlready ? "Saved" : "Save Scan"}
            </button>
          </div>
        </Card>
      </div>
      {renderModal()}
    </>
  );
}

const SCAN_TABS = [
  { id: "text", label: "Text / Message", icon: ScanLine },
  { id: "image", label: "Screenshot", icon: ImagePlus },
  { id: "link", label: "Suspicious Link", icon: Link2 },
  { id: "upi", label: "UPI / Payment", icon: CreditCard },
  { id: "phone", label: "Phone / Caller", icon: Phone },
  { id: "qr", label: "QR Code", icon: QrCode },
];

export default function ScannerPage({
  onSaveScan,
  onAskCoach,
  onGoReport,
  onGoSimulation,
  scanHistory,
  ollamaHost,
  ollamaModel,
  guardianMode,
  prefilledText = ""
}) {
  const [tab, setTab] = useState("text");
  const [viewingScan, setViewingScan] = useState(null);
  const [useOllama, setUseOllama] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [checkingOllama, setCheckingOllama] = useState(true);

  // Inputs
  const [text, setText] = useState(prefilledText || "");

  useEffect(() => {
    if (prefilledText) {
      setText(prefilledText);
      setTab("text");
    }
  }, [prefilledText]);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [url, setUrl] = useState("");
  const [urlContext, setUrlContext] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiMsg, setUpiMsg] = useState("");
  const [phoneOrg, setPhoneOrg] = useState("");
  const [phoneScript, setPhoneScript] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);
  const [qrDecoded, setQrDecoded] = useState("");

  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check if Ollama is running on mount or host/model change
    setCheckingOllama(true);
    ollamaService.fetchModels(ollamaHost)
      .then((models) => {
        const hasModels = models && models.length > 0;
        setOllamaAvailable(true);
        if (hasModels) {
          setUseOllama(true); // default to true if available and has models
        }
      })
      .catch(() => {
        setOllamaAvailable(false);
        setUseOllama(false);
      })
      .finally(() => setCheckingOllama(false));
  }, [ollamaHost]);

  const handleFileChange = (f) => {
    if (!f) return;
    setImageFile(f);
    setImageUrl(URL.createObjectURL(f));
    setPhase("idle");
    setResult(null);
    setSaved(false);
  };

  const handleQrFileChange = (f) => {
    if (!f) return;
    setQrFile(f);
    setQrPreviewUrl(URL.createObjectURL(f));
    setQrDecoded("");
    setPhase("idle");
    setResult(null);
    setSaved(false);
  };

  const getActiveTextToScan = () => {
    // If in Guardian Mode, scan the text input or link context directly
    if (guardianMode) {
      return text;
    }
    switch (tab) {
      case "text": return text;
      case "image": return extractedText;
      case "link": return `${url} ${urlContext}`;
      case "upi": return `${upiId} ${upiMsg}`;
      case "phone": return `${phoneOrg} ${phoneScript}`;
      case "qr": return qrDecoded;
      default: return "";
    }
  };

  const handleRunScan = async () => {
    const textToScan = getActiveTextToScan();
    if (!textToScan.trim()) return;

    setPhase("analyzing");
    setResult(null);
    setSaved(false);
  };

  const handleDone = async () => {
    const textToScan = getActiveTextToScan();
    let localResult = null;
    
    // Evaluate heuristics
    if (!guardianMode && tab === "link") {
      const base = analyzeUrlHeuristics(url);
      if (urlContext.trim()) {
        const textResult = runScamAnalysis(urlContext);
        localResult = textResult.riskScore > base.riskScore
          ? {
              ...base,
              ...textResult,
              entities: { ...textResult.entities, urls: [...new Set([url, ...textResult.entities.urls])] },
              detectedSignals: [...base.detectedSignals, ...textResult.detectedSignals],
              explanation: `${base.explanation} ${textResult.explanation}`,
              localHeuristicOnly: true
            }
          : base;
      } else {
        localResult = base;
      }
    } else {
      // Handles both Guardian Mode scans and standard text checks
      localResult = runScamAnalysis(textToScan);
    }

    if (useOllama && ollamaAvailable) {
      try {
        const aiResponse = await ollamaService.analyzeScam(textToScan, ollamaHost, ollamaModel);
        
        const finalResult = {
          ...localResult,
          riskScore: Math.round((localResult.riskScore + aiResponse.riskScore) / 2),
          ...(() => {
            const score = Math.round((localResult.riskScore + aiResponse.riskScore) / 2);
            if (score <= 20) return { riskLevel: "low", riskLabel: "Low Risk", tone: "safe", verdictText: "No strong indicators detected" };
            if (score <= 45) return { riskLevel: "caution", riskLabel: "Caution", tone: "info", verdictText: "A few cautionary triggers present" };
            if (score <= 70) return { riskLevel: "suspicious", riskLabel: "Suspicious", tone: "warning", verdictText: "Several suspicious patterns detected" };
            if (score <= 89) return { riskLevel: "high", riskLabel: "High Risk", tone: "danger", verdictText: "Strong scam indicators detected" };
            return { riskLevel: "critical", riskLabel: "Critical Risk", tone: "danger", verdictText: "Highly likely scam detected" };
          })(),
          scamType: aiResponse.scamType || localResult.scamType,
          aiResult: aiResponse,
          explanation: localResult.detectedSignals.length > 0 
            ? `${localResult.explanation} AI agrees: ${aiResponse.explanation}` 
            : aiResponse.explanation
        };

        setResult(finalResult);
      } catch (err) {
        console.error("Ollama deep scan failed. Falling back to local heuristics.", err);
        setResult({
          ...localResult,
          explanation: `${localResult.explanation} (AI Deep Scan failed: Ollama connection offline)`
        });
      }
    } else {
      setResult(localResult);
    }
    setPhase("done");
  };

  const handleSave = (r) => {
    onSaveScan(guardianMode ? "text" : tab, getActiveTextToScan().slice(0, 140), r);
    setSaved(true);
  };

  const handleTabChange = (t) => {
    setTab(t);
    setViewingScan(null);
    setResult(null);
    setPhase("idle");
  };

  const analysisSteps = useOllama && ollamaAvailable
    ? [
        "Consulting local heuristic rule engines...",
        "Dispatching request to local Ollama service...",
        "Ollama: Performing semantic deep scan...",
        "Ollama: Analyzing threat models & urgency factors...",
        "Aggregating heuristic alerts and AI verdicts..."
      ]
    : null;

  // ---- Guardian Mode View Render ----
  if (guardianMode) {
    return (
      <div className="ss-page" style={{ animation: "fadeIn 0.3s ease" }}>
        <SectionHeading eyebrow="Guardian Safe Checker" title="Check message for scams" />

        {viewingScan ? (
          <>
            <button className="ss-link-btn" onClick={() => setViewingScan(null)}>
              <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to Safe Checker
            </button>
            <div className="ss-heuristic-note"><Eye size={13} /> Viewing a saved scan report</div>
            <ScanResultPanel result={viewingScan.result} savedAlready onSave={() => {}} onAskCoach={onAskCoach} onGoReport={onGoReport} onGoSimulation={onGoSimulation} guardianMode={guardianMode} />
          </>
        ) : (
          <>
            <Card style={{ padding: "24px" }}>
              <label className="ss-label" htmlFor="scan-guardian-text" style={{ fontSize: "16px", fontWeight: "700" }}>
                Paste the message, website link, or text you received:
              </label>
              
              <textarea
                id="scan-guardian-text"
                className="ss-textarea"
                rows={6}
                style={{ fontSize: "16px", padding: "14px", borderRadius: "10px", marginTop: "8px" }}
                placeholder="Paste or type SMS messages, WhatsApp requests, or links here..."
                value={text}
                onChange={(e) => { setText(e.target.value); setPhase("idle"); setResult(null); }}
              />

              <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button 
                  className="ss-btn-primary" 
                  style={{ width: "100%", padding: "14px", fontSize: "17px", minHeight: "52px" }} 
                  onClick={handleRunScan} 
                  disabled={phase === "analyzing" || !text.trim()}
                >
                  {phase === "analyzing" ? "Analyzing for scams..." : "🔍 CHECK FOR SCAMS"}
                </button>
              </div>

              {/* Simplified screenshot uploader */}
              <div style={{ borderTop: "1px solid var(--surface-border)", marginTop: "20px", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>Have a photo or screenshot?</span>
                {!imageFile ? (
                  <button 
                    className="ss-btn-secondary"
                    style={{ width: "auto", margin: 0, padding: "6px 12px", minHeight: "auto", fontSize: "13px" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Screenshot
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", color: "var(--safe-strong)" }}>File loaded</span>
                    <button 
                      style={{ background: "none", border: "none", color: "var(--danger)" }}
                      onClick={() => { setImageFile(null); setImageUrl(null); setText(""); setPhase("idle"); setResult(null); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    handleFileChange(f);
                    setText(getDemoExtraction(f.size)); // auto extracts demo text in sandbox
                  }
                }} />
              </div>
            </Card>

            {phase === "analyzing" && <AnalysisProgress onDone={handleDone} steps={analysisSteps} />}
            {phase === "done" && <ScanResultPanel result={result} savedAlready={saved} onSave={handleSave} onAskCoach={onAskCoach} onGoReport={onGoReport} onGoSimulation={onGoSimulation} guardianMode={guardianMode} />}

            {/* Simplified history */}
            {scanHistory.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "10px" }}>Your Past Checks</h3>
                <div className="ss-history-list">
                  {scanHistory.slice(0, 4).map((s) => (
                    <button key={s.id} className="ss-history-item" onClick={() => setViewingScan(s)} style={{ padding: "14px" }}>
                      <Badge tone={s.result.tone}>{s.riskLabel}</Badge>
                      <div className="ss-history-item-body">
                        <div className="ss-history-item-title" style={{ fontSize: "14.5px" }}>{s.result.riskScore >= 45 ? "Suspicious Message" : "Safe Message"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Checked on {new Date(s.timestamp).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ---- Advanced Mode View Render (Original) ----
  return (
    <div className="ss-page">
      <SectionHeading eyebrow="AI Scam Scanner" title="Analyse suspicious content before you act" />

      {/* Ollama deep scan toggle */}
      <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Badge tone={ollamaAvailable ? "safe-strong" : "warning"}>
            {checkingOllama ? "Checking Ollama..." : ollamaAvailable ? "Ollama Connected" : "Ollama Offline"}
          </Badge>
          <span className="ss-hint" style={{ fontSize: "12px" }}>
            {ollamaAvailable 
              ? `Running local model: ${ollamaModel || "default"}` 
              : "Start Ollama on your system to enable semantic Deep AI scanning."}
          </span>
        </div>
        <label className="ss-toggle" style={{ opacity: ollamaAvailable ? 1 : 0.5 }}>
          <input 
            type="checkbox" 
            checked={useOllama} 
            onChange={(e) => setUseOllama(e.target.checked && ollamaAvailable)} 
            disabled={!ollamaAvailable} 
          />
          <span className="ss-toggle-track"><span className="ss-toggle-thumb" /></span>
          Deep AI Scan
        </label>
      </Card>

      <div className="ss-scan-tabs">
        {SCAN_TABS.map((t) => (
          <button key={t.id} className={`ss-scan-tab ${tab === t.id ? "active" : ""}`} onClick={() => handleTabChange(t.id)}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {viewingScan ? (
        <>
          <button className="ss-link-btn" onClick={() => setViewingScan(null)}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to scanner</button>
          <div className="ss-heuristic-note"><Eye size={13} /> Viewing a saved scan from {new Date(viewingScan.timestamp).toLocaleString("en-IN")}</div>
          <ScanResultPanel result={viewingScan.result} savedAlready onSave={() => {}} onAskCoach={onAskCoach} onGoReport={onGoReport} onGoSimulation={onGoSimulation} guardianMode={guardianMode} />
        </>
      ) : (
        <>
          {tab === "text" && (
            <Card>
              <label className="ss-label" htmlFor="scan-text">Message or call transcript</label>
              <textarea
                id="scan-text" className="ss-textarea" rows={6}
                placeholder="e.g. This is CBI, you are under digital arrest, stay on video call and do not disconnect..."
                value={text}
                onChange={(e) => { setText(e.target.value); setPhase("idle"); setResult(null); }}
              />
              <div className="ss-scanner-actions">
                <button className="ss-btn-primary" onClick={handleRunScan} disabled={phase === "analyzing" || !text.trim()}>
                  {phase === "analyzing" ? "Analysing…" : "Analyze for Scam"}
                </button>
                <span className="ss-hint">Analyzes semantic intent and heuristic scam markers</span>
              </div>
            </Card>
          )}

          {tab === "image" && (
            <Card>
              <label className="ss-label">Screenshot</label>
              {!imageFile ? (
                <div
                  className={`ss-dropzone ${dragOver ? "over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={22} className="ss-icon-accent" />
                  <div>Drag & drop a screenshot, or click to browse</div>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e.target.files?.[0])} />
                </div>
              ) : (
                <div className="ss-dropzone-preview">
                  <img src={imageUrl} alt="Uploaded screenshot preview" />
                  <div className="ss-dropzone-preview-actions">
                    <button className="ss-btn-secondary" onClick={() => fileInputRef.current?.click()}>Change image</button>
                    <button className="ss-btn-secondary" onClick={() => { setImageFile(null); setImageUrl(null); setExtractedText(""); setPhase("idle"); setResult(null); }}><Trash2 size={13} /> Remove</button>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e.target.files?.[0])} />
                  </div>
                </div>
              )}
              {imageFile && (
                <div style={{ marginTop: 14 }}>
                  <div className="ss-heuristic-note"><Info size={13} /> No vision models are loaded locally. Paste the text visible in the screenshot below, or try a sample.</div>
                  <label className="ss-label" htmlFor="scan-image-text" style={{ marginTop: 10 }}>Extracted text</label>
                  <textarea id="scan-image-text" className="ss-textarea" rows={4} value={extractedText} onChange={(e) => { setExtractedText(e.target.value); setPhase("idle"); setResult(null); }} placeholder="Type the message text shown in the screenshot..." />
                  <div className="ss-scanner-actions">
                    <button className="ss-btn-primary" onClick={handleRunScan} disabled={phase === "analyzing" || !extractedText.trim()}>{phase === "analyzing" ? "Analysing…" : "Analyze for Scam"}</button>
                    <button className="ss-link-btn" onClick={() => { setExtractedText(getDemoExtraction(imageFile ? imageFile.size : 0)); }}><RefreshCw size={13} /> Try a demo example</button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {tab === "link" && (
            <Card>
              <label className="ss-label" htmlFor="scan-url">Suspicious URL</label>
              <input id="scan-url" className="ss-input" placeholder="e.g. http://cbi-verify.secure-kyc-update.xyz" value={url} onChange={(e) => { setUrl(e.target.value); setPhase("idle"); }} />
              <label className="ss-label" style={{ marginTop: 12 }} htmlFor="scan-url-context">Message context (optional)</label>
              <textarea id="scan-url-context" className="ss-textarea" rows={3} placeholder="Paste the message this link came with, if any..." value={urlContext} onChange={(e) => { setUrlContext(e.target.value); setPhase("idle"); }} />
              <div className="ss-scanner-actions">
                <button className="ss-btn-primary" onClick={handleRunScan} disabled={phase === "analyzing" || !url.trim()}>{phase === "analyzing" ? "Analysing…" : "Analyze for Scam"}</button>
                <span className="ss-hint">Checks URL structure for lookalike indicators</span>
              </div>
            </Card>
          )}

          {tab === "upi" && (
            <Card>
              <label className="ss-label" htmlFor="scan-upi-id">UPI ID (optional)</label>
              <input id="scan-upi-id" className="ss-input" placeholder="e.g. merchant@upi" value={upiId} onChange={(e) => { setUpiId(e.target.value); setPhase("idle"); }} />
              <label className="ss-label" style={{ marginTop: 12 }} htmlFor="scan-upi-msg">Payment request / message</label>
              <textarea id="scan-upi-msg" className="ss-textarea" rows={4} placeholder="e.g. Scan this QR and enter your UPI PIN to receive ₹5,000 refund" value={upiMsg} onChange={(e) => { setUpiMsg(e.target.value); setPhase("idle"); }} />
              <div className="ss-heuristic-note"><Info size={13} /> Entering a UPI PIN always authorizes a payment out of your account — it is never required to receive money. Always check exactly what you're approving before entering it.</div>
              <div className="ss-scanner-actions">
                <button className="ss-btn-primary" onClick={handleRunScan} disabled={phase === "analyzing" || (!upiMsg.trim() && !upiId.trim())}>{phase === "analyzing" ? "Analysing…" : "Analyze for Scam"}</button>
              </div>
            </Card>
          )}

          {tab === "phone" && (
            <Card>
              <label className="ss-label" htmlFor="scan-phone-num">Phone number (optional)</label>
              <input id="scan-phone-num" className="ss-input" placeholder="e.g. +91 98xxxxxx12" value={phoneNum} onChange={(e) => { setPhoneNum(e.target.value); setPhase("idle"); }} />
              <label className="ss-label" style={{ marginTop: 12 }} htmlFor="scan-phone-org">Claimed organization</label>
              <input id="scan-phone-org" className="ss-input" placeholder="e.g. CBI, Bank fraud department, TRAI" value={phoneOrg} onChange={(e) => { setPhoneOrg(e.target.value); setPhase("idle"); }} />
              <label className="ss-label" style={{ marginTop: 12 }} htmlFor="scan-phone-script">What did they say?</label>
              <textarea id="scan-phone-script" className="ss-textarea" rows={4} value={phoneScript} onChange={(e) => { setPhoneScript(e.target.value); setPhase("idle"); }} placeholder="Describe or paste what the caller said..." />
              <div className="ss-scanner-actions">
                <button className="ss-btn-primary" onClick={handleRunScan} disabled={phase === "analyzing" || !phoneScript.trim()}>{phase === "analyzing" ? "Analysing…" : "Analyze for Scam"}</button>
                <span className="ss-hint">Checks the caller script for psychological coercion patterns</span>
              </div>
            </Card>
          )}

          {tab === "qr" && (
            <Card>
              <label className="ss-label">QR code image</label>
              {!qrFile ? (
                <div className="ss-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={22} className="ss-icon-accent" />
                  <div>Click to upload a QR code image</div>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleQrFileChange(e.target.files?.[0])} />
                </div>
              ) : (
                <div className="ss-dropzone-preview">
                  <img src={qrPreviewUrl} alt="QR code preview" style={{ maxWidth: 160 }} />
                  <div className="ss-dropzone-preview-actions">
                    <button className="ss-btn-secondary" onClick={() => fileInputRef.current?.click()}>Change image</button>
                    <button className="ss-btn-secondary" onClick={() => { setQrFile(null); setQrPreviewUrl(null); setQrDecoded(""); setPhase("idle"); setResult(null); }}><Trash2 size={13} /> Remove</button>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleQrFileChange(e.target.files?.[0])} />
                  </div>
                </div>
              )}
              {qrFile && (
                <div style={{ marginTop: 14 }}>
                  <div className="ss-heuristic-note"><Info size={13} /> Paste the decoded content below (usually a link/text) to analyze.</div>
                  <label className="ss-label" htmlFor="scan-qr-decoded" style={{ marginTop: 10 }}>Decoded content</label>
                  <textarea id="scan-qr-decoded" className="ss-textarea" rows={3} value={qrDecoded} onChange={(e) => { setQrDecoded(e.target.value); setPhase("idle"); }} placeholder="Paste the URL or text the QR code decodes to..." />
                  <div className="ss-scanner-actions">
                    <button className="ss-btn-primary" onClick={handleRunScan} disabled={phase === "analyzing" || !qrDecoded.trim()}>{phase === "analyzing" ? "Analysing…" : "Analyze for Scam"}</button>
                    <button className="ss-link-btn" onClick={() => { setQrDecoded("https://secure-kyc-refund.xyz/claim?amt=5000"); }}><RefreshCw size={13} /> Try a demo example</button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {phase === "analyzing" && <AnalysisProgress onDone={handleDone} steps={analysisSteps} />}
          {phase === "done" && <ScanResultPanel result={result} savedAlready={saved} onSave={handleSave} onAskCoach={onAskCoach} onGoReport={onGoReport} onGoSimulation={onGoSimulation} guardianMode={guardianMode} />}
        </>
      )}

      {!viewingScan && (
        <div>
          <div className="ss-card-title" style={{ marginTop: 16 }}>Recent Scans</div>
          {scanHistory.length ? (
            <div className="ss-history-list">
              {scanHistory.slice(0, 8).map((s) => (
                <button key={s.id} className="ss-history-item" onClick={() => setViewingScan(s)}>
                  <Badge tone={s.result.tone}>{s.riskLabel}</Badge>
                  <div className="ss-history-item-body">
                    <div className="ss-history-item-title">{s.scamType !== "No specific pattern matched" ? s.scamType : SCAN_TABS.find((t) => t.id === s.inputType)?.label}</div>
                    <div className="ss-history-item-meta">{SCAN_TABS.find((t) => t.id === s.inputType)?.label} · {new Date(s.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</div>
                  </div>
                  <div className="ss-risk-score" style={{ fontSize: 16 }}>{s.riskScore}</div>
                </button>
              ))}
            </div>
          ) : <EmptyState icon={ScanLine} title="No scans yet" body="Analyzed content will appear here so you can revisit it anytime." />}
        </div>
      )}
    </div>
  );
}
