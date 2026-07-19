import React, { useState, useRef, useEffect } from "react";
import {
  ScanLine, ImagePlus, Link2, CreditCard, Phone, QrCode, Upload, Trash2,
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Info, HelpCircle,
  BookmarkPlus, MessageCircleQuestion, Flag, FlaskConical, ChevronRight, Eye, XCircle
} from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import SectionHeading from "../components/SectionHeading";
import { runScamAnalysis, analyzeUrlHeuristics, getDemoExtraction, mapScamTypeToReportOption } from "../services/scamEngine";
import { ollamaService } from "../services/ollama";

const VERDICT_ICON = { safe: ShieldCheck, info: Info, warning: AlertTriangle, danger: XCircle };

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

function ScanResultPanel({ result, savedAlready, onSave, onAskCoach, onGoReport, onGoSimulation }) {
  if (!result || result.riskLevel === "empty") return null;
  const VerdictIcon = VERDICT_ICON[result.tone] || Info;
  const hasEntities = result.entities && (result.entities.phones?.length || result.entities.amounts?.length || result.entities.urls?.length);

  // If the result contains Ollama AI details, we'll format it beautifully
  const isAiEnhanced = !!result.aiResult;

  return (
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

      <Card style={{ padding: "14px 20px" }}>
        <div className="ss-scan-actions-row">
          <button className="ss-btn-tertiary" onClick={() => onAskCoach(result.scamType)}><MessageCircleQuestion size={14} /> Ask AI Scam Coach</button>
          <button className="ss-btn-tertiary" onClick={() => onGoReport(result)}><Flag size={14} /> Report Scam</button>
          <button className="ss-btn-tertiary" onClick={onGoSimulation}><FlaskConical size={14} /> Start Related Simulation</button>
          <button className="ss-btn-primary ss-btn-tertiary-primary" onClick={() => onSave(result)} disabled={savedAlready}>
            <BookmarkPlus size={14} /> {savedAlready ? "Saved" : "Save Scan"}
          </button>
        </div>
      </Card>
    </div>
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
  ollamaModel
}) {
  const [tab, setTab] = useState("text");
  const [viewingScan, setViewingScan] = useState(null);
  const [useOllama, setUseOllama] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [checkingOllama, setCheckingOllama] = useState(true);

  // Inputs
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [url, setUrl] = useState("");
  const [urlContext, setUrlContext] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiMsg, setUpiMsg] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
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
        const hasModels = models.length > 0;
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
    
    // Evaluate heuristics first
    if (tab === "link") {
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
      localResult = runScamAnalysis(textToScan);
    }

    if (useOllama && ollamaAvailable) {
      try {
        const aiResponse = await ollamaService.analyzeScam(textToScan, ollamaHost, ollamaModel);
        
        // Merge heuristic and AI results
        const finalResult = {
          ...localResult,
          // Average the scores or let AI dictate if it's higher
          riskScore: Math.round((localResult.riskScore + aiResponse.riskScore) / 2),
          // Set tone/labels based on merged score
          ...(() => {
            const band = runScamAnalysis(textToScan); // helper mapping
            const score = Math.round((localResult.riskScore + aiResponse.riskScore) / 2);
            if (score <= 20) return { riskLevel: "low", riskLabel: "Low Risk", tone: "safe", verdictText: "No strong indicators detected" };
            if (score <= 45) return { riskLevel: "caution", riskLabel: "Caution", tone: "info", verdictText: "A few cautionary triggers present" };
            if (score <= 70) return { riskLevel: "suspicious", riskLabel: "Suspicious", tone: "warning", verdictText: "Several suspicious patterns detected" };
            if (score <= 89) return { riskLevel: "high", riskLabel: "High Risk", tone: "danger", verdictText: "Strong scam indicators detected" };
            return { riskLevel: "critical", riskLabel: "Critical Risk", tone: "danger", verdictText: "Highly likely scam detected" };
          })(),
          scamType: aiResponse.scamType || localResult.scamType,
          aiResult: aiResponse, // embed original AI result
          explanation: localResult.detectedSignals.length > 0 
            ? `${localResult.explanation} AI agrees: ${aiResponse.explanation}` 
            : aiResponse.explanation
        };

        setResult(finalResult);
      } catch (err) {
        console.error("Ollama deep scan failed. Falling back to local heuristics.", err);
        // Fallback to local heuristic only with warning
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
    onSaveScan(tab, getActiveTextToScan().slice(0, 140), r);
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
          <ScanResultPanel result={viewingScan.result} savedAlready onSave={() => {}} onAskCoach={onAskCoach} onGoReport={onGoReport} onGoSimulation={onGoSimulation} />
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
          {phase === "done" && <ScanResultPanel result={result} savedAlready={saved} onSave={handleSave} onAskCoach={onAskCoach} onGoReport={onGoReport} onGoSimulation={onGoSimulation} />}
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
