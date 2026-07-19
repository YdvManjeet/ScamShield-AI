import React, { useState, useRef, useEffect } from "react";
import {
  Phone, KeyRound, Briefcase, ChevronRight, ShieldCheck, ShieldX,
  AlertTriangle, Play, HelpCircle, RefreshCw, Send, CheckCircle2, Lock
} from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";
import { ollamaService } from "../services/ollama";

const SCENARIOS = [
  { id: "digital-arrest", title: "Digital Arrest Video Call", desc: "A caller claiming to be CBI says a package with drugs was found in your name.", icon: Phone, difficulty: "Hard", estMinutes: 4 },
  { id: "upi-refund", title: "Fake UPI Refund", desc: "An online buyer claims they accidentally overpaid you Rs. 5,000.", icon: KeyRound, difficulty: "Medium", estMinutes: 2 },
  { id: "courier", title: "FedEx Courier Scam", desc: "FedEx customs claims illegal passports were shipped under your name.", icon: Briefcase, difficulty: "Hard", estMinutes: 3 }
];

export default function SimulationPage({ onCompleteSimulation, ollamaHost, ollamaModel }) {
  const [simulationType, setSimulationType] = useState(null); // null | 'classic' | 'live'
  const [activeScenario, setActiveScenario] = useState(null);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [checkingOllama, setCheckingOllama] = useState(true);

  // Classic Simulation State
  const [classicStep, setClassicStep] = useState(0);
  const [classicOutcome, setClassicOutcome] = useState(null);

  // Live AI Simulation State
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [pressure, setPressure] = useState(0);
  const [liveOutcome, setLiveOutcome] = useState(null); // null | 'evaluating' | 'done'
  const [evaluation, setEvaluation] = useState(null);
  const [waitingForScammer, setWaitingForScammer] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    // Check if Ollama is running
    setCheckingOllama(true);
    ollamaService.fetchModels(ollamaHost)
      .then((models) => {
        setOllamaAvailable(models.length > 0);
      })
      .catch(() => {
        setOllamaAvailable(false);
      })
      .finally(() => setCheckingOllama(false));
  }, [ollamaHost]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, waitingForScammer]);

  // Classic Scenario Steps (Original static logic)
  const digitalArrestSteps = [
    {
      prompt: "The caller says: 'This is Officer Verma, CBI. Your Aadhaar was used in a money laundering case. Do not disconnect this call.' What do you do?",
      options: [
        { text: "Stay on the call and ask what to do next", correct: false },
        { text: "Hang up and independently verify via the agency's official helpline", correct: true },
      ],
    },
    {
      prompt: "The caller then says: 'To prove your innocence, transfer ₹50,000 to this RBI verification account, refundable in 24 hours.' What do you do?",
      options: [
        { text: "Transfer the money since it's 'refundable'", correct: false },
        { text: "Refuse — no legitimate agency ever asks for money to 'verify innocence'", correct: true },
      ],
    },
  ];

  const handleClassicAnswer = (opt) => {
    if (classicStep < digitalArrestSteps.length - 1) {
      setClassicStep(classicStep + 1);
    } else {
      const passed = opt.correct;
      setClassicOutcome(passed);
      onCompleteSimulation(activeScenario.id, passed);
    }
  };

  const startClassicSimulation = (scenario) => {
    setActiveScenario(scenario);
    setSimulationType("classic");
    setClassicStep(0);
    setClassicOutcome(null);
  };

  // Live AI Simulation Logic
  const startLiveSimulation = async (scenario) => {
    setActiveScenario(scenario);
    setSimulationType("live");
    setPressure(10);
    setLiveOutcome(null);
    setEvaluation(null);
    setWaitingForScammer(true);

    let openingLine = "";
    if (scenario.id === "digital-arrest") {
      openingLine = "Hello. This is Officer Arjun Mehta from the Cyber Cell investigation department. Am I speaking with you? Your Aadhaar ID is flagged in a high-profile narcotics and money-laundering case involving a package seized in Mumbai.";
    } else if (scenario.id === "upi-refund") {
      openingLine = "Hey there! I am extremely sorry to bother you, but I just bought something from your catalog and I think I accidentally sent you Rs. 5,000 instead of Rs. 500! Oh my god, my landlord is demanding rent today, please tell me you got the transfer?";
    } else {
      openingLine = "Good day, this is the FedEx international custom clearance desk. We have intercepted a package sent in your name containing illegal materials and multiple forged credentials. We are initiating a connection to the local cyber bureau.";
    }

    const initialMsg = { from: "scammer", text: openingLine, timestamp: new Date().toISOString() };
    setMessages([initialMsg]);
    setWaitingForScammer(false);
  };

  const handleSendLiveMessage = async () => {
    if (!userInput.trim() || waitingForScammer) return;

    const userMsg = { from: "user", text: userInput, timestamp: new Date().toISOString() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setUserInput("");
    setWaitingForScammer(true);

    // Increase psychological pressure
    setPressure(prev => Math.min(100, prev + 12));

    try {
      const reply = await ollamaService.chatWithScammer(nextHistory, activeScenario.id, ollamaHost, ollamaModel);
      setMessages(prev => [...prev, { from: "scammer", text: reply, timestamp: new Date().toISOString() }]);
    } catch (err) {
      console.error("AI scammer failed to respond:", err);
      setMessages(prev => [...prev, { from: "scammer", text: "(Call drops... Scammer is calling you back)", timestamp: new Date().toISOString() }]);
    } finally {
      setWaitingForScammer(false);
    }
  };

  // User Actions during Chat Simulation
  const handleHangUp = async () => {
    setLiveOutcome("evaluating");
    setWaitingForScammer(true);

    // Final evaluation by AI
    const historyToEval = [...messages, { from: "user", text: "[USER HANGS UP THE CALL / DISCONNECTS CHAT]" }];
    setMessages(historyToEval);

    try {
      const report = await ollamaService.evaluateSimulation(historyToEval, activeScenario.id, ollamaHost, ollamaModel);
      setEvaluation(report);
      onCompleteSimulation(activeScenario.id, report.passed);
    } catch (err) {
      console.error("Evaluation failed:", err);
      // Fallback evaluation
      const fallbackReport = {
        passed: true,
        score: Math.max(0, 100 - pressure),
        pressureAccumulated: pressure,
        strengths: ["Safely terminated the interaction by hanging up."],
        weaknesses: ["None noted. Disconnecting is the safest procedure."],
        debriefText: "You successfully disconnected the call. In real life, ending communication immediately is the single most effective shield against psychological manipulation."
      };
      setEvaluation(fallbackReport);
      onCompleteSimulation(activeScenario.id, true);
    } finally {
      setLiveOutcome("done");
      setWaitingForScammer(false);
    }
  };

  const handleTriggerAction = async (actionType) => {
    setLiveOutcome("evaluating");
    setWaitingForScammer(true);

    const actionText = actionType === "pay"
      ? "[USER TRANSFERS MONEY AS DEMANDED]"
      : actionType === "otp"
      ? "[USER REVEALS THE OTP CODE]"
      : "[USER SHARS CARD DETAILS / AADHAAR ID]";

    const historyToEval = [...messages, { from: "user", text: actionText }];
    setMessages(historyToEval);

    try {
      const report = await ollamaService.evaluateSimulation(historyToEval, activeScenario.id, ollamaHost, ollamaModel);
      setEvaluation(report);
      onCompleteSimulation(activeScenario.id, report.passed);
    } catch (err) {
      console.error("Evaluation failed:", err);
      const fallbackReport = {
        passed: false,
        score: 15,
        pressureAccumulated: 85,
        strengths: ["Attempted to answer the scammer's questions initially."],
        weaknesses: ["Complied with the scammer's critical demand."],
        debriefText: `You complied with a critical demand (${actionType}). Real agencies never ask you to transfer funds, share OTPs, or verify identity details under coercion. This is how financial theft occurs.`
      };
      setEvaluation(fallbackReport);
      onCompleteSimulation(activeScenario.id, false);
    } finally {
      setLiveOutcome("done");
      setWaitingForScammer(false);
    }
  };

  const exitSimulation = () => {
    setSimulationType(null);
    setActiveScenario(null);
    setMessages([]);
    setPressure(0);
    setEvaluation(null);
  };

  // Renders
  if (simulationType === "classic" && activeScenario) {
    const stepData = digitalArrestSteps[classicStep];
    return (
      <div className="ss-page">
        <button className="ss-link-btn" onClick={exitSimulation}>
          <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to scenarios
        </button>
        <Card className="ss-sim-card" style={{ margin: "10px auto 0" }}>
          <Badge tone="danger" icon={Phone}>Simulated Branching Scenario (Offline)</Badge>
          <div style={{ marginTop: "10px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>{activeScenario.title}</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "18px" }}>{activeScenario.desc}</p>
          </div>
          {classicOutcome === null ? (
            <>
              <p className="ss-sim-prompt">{stepData.prompt}</p>
              <div className="ss-sim-options">
                {stepData.options.map((o, i) => (
                  <button key={i} className="ss-sim-option" onClick={() => handleClassicAnswer(o)}>{o.text}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="ss-sim-result" style={{ gap: "10px" }}>
              {classicOutcome ? (
                <>
                  <ShieldCheck size={32} className="ss-icon-safe" />
                  <h3>You successfully resisted the scam!</h3>
                  <p>Excellent work. You refused the threat and chose verification. Simulation Performance +6.</p>
                </>
              ) : (
                <>
                  <ShieldX size={32} className="ss-icon-danger" />
                  <h3>This would have cost you money!</h3>
                  <p>Real agencies never request payment or bank deposits over call. Go through the Scam Missions to learn how to identify fear tactics.</p>
                </>
              )}
              <button className="ss-btn-primary" onClick={exitSimulation} style={{ marginTop: "14px" }}>Return to Lab</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (simulationType === "live" && activeScenario) {
    const isUpiScam = activeScenario.id === "upi-refund";
    const getPressureColor = () => {
      if (pressure < 35) return "var(--safe-strong)";
      if (pressure < 70) return "var(--warning)";
      return "var(--danger)";
    };

    return (
      <div className="ss-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="ss-link-btn" onClick={exitSimulation}>
            <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> End Simulation
          </button>
          <Badge tone="danger">Live Simulated Scam Call</Badge>
        </div>

        <div className="ss-grid-2" style={{ gridTemplateColumns: "1.7fr 1fr", gap: "20px" }}>
          {/* Main Chat Area */}
          <Card className="ss-sim-chat-window">
            <div className="ss-sim-meta-header">
              <div className="ss-sim-meta-item">
                <strong>Simulating:</strong> {activeScenario.title}
              </div>
              <div className="ss-sim-pressure-meter">
                <span style={{ fontSize: "11px", fontWeight: "600" }}>Stress level:</span>
                <div className="ss-sim-pressure-bar">
                  <div className="ss-sim-pressure-fill" style={{ width: `${pressure}%`, backgroundColor: getPressureColor() }} />
                </div>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: getPressureColor(), fontWeight: "700" }}>{pressure}%</span>
              </div>
            </div>

            {liveOutcome !== "done" ? (
              <>
                <div className="ss-sim-thread">
                  {messages.map((m, i) => (
                    <div key={i} className={`ss-sim-msg ${m.from}`}>
                      {m.text}
                    </div>
                  ))}
                  {waitingForScammer && (
                    <div className="ss-sim-msg scammer" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="ss-spinner" style={{ width: "10px", height: "10px" }} />
                      <span>Scammer is typing...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {liveOutcome === "evaluating" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 0", borderTop: "1px solid var(--surface-border)" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <span className="ss-spinner" />
                      <span>AI Safety Officer generating debrief report...</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "12px" }}>
                    <div className="ss-sim-input-row">
                      <input
                        className="ss-input"
                        placeholder="Type your response to the caller..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendLiveMessage()}
                        disabled={waitingForScammer}
                      />
                      <button className="ss-btn-primary ss-btn-icon" onClick={handleSendLiveMessage} disabled={waitingForScammer || !userInput.trim()}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Simulation complete, display debrief
              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", padding: "10px 0" }}>
                {evaluation ? (
                  <div className="ss-sim-debrief-card">
                    <div className="ss-sim-debrief-score-row">
                      <div style={{ width: "120px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Survival Score</span>
                        <h2 style={{ fontSize: "40px", fontFamily: "monospace", color: evaluation.passed ? "var(--safe-strong)" : "var(--danger)", margin: "4px 0" }}>
                          {evaluation.score}
                        </h2>
                        <Badge tone={evaluation.passed ? "safe-strong" : "danger"}>
                          {evaluation.passed ? "Resisted" : "Scammed"}
                        </Badge>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3>AI Safety Performance Debrief</h3>
                        <p style={{ marginTop: "4px", fontSize: "13px" }}>{evaluation.debriefText}</p>
                      </div>
                    </div>

                    <div className="ss-explain-grid">
                      <div className="ss-why-box" style={{ background: "rgba(34, 197, 94, 0.05)", borderColor: "rgba(34,197,94,0.15)" }}>
                        <div className="ss-explain-label safe"><ShieldCheck size={13} style={{ display: "inline", marginRight: "4px" }} /> Safe Decisions</div>
                        {evaluation.strengths?.length > 0 ? (
                          <ul style={{ margin: "5px 0", paddingLeft: "16px", fontSize: "12.5px" }}>
                            {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        ) : <p style={{ fontSize: "12px" }}>No active resistance demonstrated.</p>}
                      </div>
                      <div className="ss-why-box" style={{ background: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239,68,68,0.15)" }}>
                        <div className="ss-explain-label warning"><AlertTriangle size={13} style={{ display: "inline", marginRight: "4px" }} /> Risks Taken</div>
                        {evaluation.weaknesses?.length > 0 ? (
                          <ul style={{ margin: "5px 0", paddingLeft: "16px", fontSize: "12.5px" }}>
                            {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                          </ul>
                        ) : <p style={{ fontSize: "12px" }}>No structural safety mistakes made.</p>}
                      </div>
                    </div>

                    <div className="ss-sim-debrief-actions">
                      <button className="ss-btn-primary" onClick={exitSimulation} style={{ flex: 1 }}>Finish Simulation</button>
                      <button className="ss-btn-secondary" onClick={() => startLiveSimulation(activeScenario)} style={{ flex: 1 }}>Try Again</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
                    <AlertTriangle size={32} className="ss-icon-warning" />
                    <h3>Evaluation Corrupted</h3>
                    <p>Unable to retrieve report details. Return to Simulation Lab.</p>
                    <button className="ss-btn-primary" onClick={exitSimulation}>Close</button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions Panel */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px", height: "fit-content" }}>
            <div className="ss-card-title"><HelpCircle size={15} /> Defensive Options</div>
            <p style={{ fontSize: "12px" }}>Select a safety action when you identify the scam pattern. Or continue messaging to practice negotiation details.</p>
            
            <button className="ss-btn-primary" onClick={handleHangUp} disabled={liveOutcome !== null} style={{ background: "var(--safe)" }}>
              🔒 Disconnect Call (Safe Exit)
            </button>
            <div style={{ borderTop: "1px solid var(--surface-border)", margin: "8px 0" }} />
            
            <button className="ss-btn-secondary" onClick={() => handleTriggerAction("pay")} disabled={liveOutcome !== null} style={{ borderColor: "rgba(239,68,68,0.4)" }}>
              💸 Transfer Rs. 98,000 (Comply)
            </button>
            <button className="ss-btn-secondary" onClick={() => handleTriggerAction("otp")} disabled={liveOutcome !== null} style={{ borderColor: "rgba(239,68,68,0.4)" }}>
              🔑 Provide OTP Code (Share PIN)
            </button>
            <button className="ss-btn-secondary" onClick={() => handleTriggerAction("id")} disabled={liveOutcome !== null} style={{ borderColor: "rgba(239,68,68,0.4)" }}>
              🪪 Send Aadhaar ID Details
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <SectionHeading eyebrow="Simulation Lab" title="Practice in a safe, simulated environment" />

      <div className="ss-heuristic-note">
        <Info size={13} /> 
        {ollamaAvailable 
          ? "Ollama local LLM is online! Live AI Scammer Simulations are available. Practice chatting against freeform threats."
          : "Ollama is offline. You can run the Classic Quiz-Based simulation below, or boot up Ollama to enable Live interactive chats."}
      </div>

      <div className="ss-grid-3">
        {SCENARIOS.map((s) => (
          <Card key={s.id} className="ss-scenario-card">
            <s.icon size={22} className="ss-icon-accent" />
            <div className="ss-card-title" style={{ marginTop: "6px" }}>{s.title}</div>
            <p className="ss-scenario-desc" style={{ flex: 1 }}>{s.desc}</p>
            <div className="ss-scenario-footer">
              <Badge tone={s.difficulty === "Hard" ? "danger" : s.difficulty === "Medium" ? "warning" : "safe"}>
                {s.difficulty}
              </Badge>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="ss-btn-secondary"
                  onClick={() => startClassicSimulation(s)}
                  style={{ width: "auto", margin: "0", padding: "8px 12px" }}
                  aria-label="Start quiz mode"
                >
                  Quiz
                </button>
                <button
                  className="ss-btn-primary"
                  onClick={() => startLiveSimulation(s)}
                  disabled={!ollamaAvailable}
                  style={{ padding: "8px 12px" }}
                  aria-label="Start live chat mode"
                >
                  Live AI
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
