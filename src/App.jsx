import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Shield, Menu, X, LayoutDashboard, ScanLine, FlaskConical,
  MessageCircleQuestion, Radar, Users, GraduationCap, Flag, Settings
} from "lucide-react";
import { scoreRepository } from "./services/storage";
import {
  calculateImmunityScore,
  getScoreStatus,
  makeScoreEvent,
  MISSIONS,
  SEED_SCORE_EVENTS,
  SIMULATION_PASS_SCHEDULE,
  SIMULATION_FIRST_FAIL_PENALTY,
  SCAN_REWARD_CAP,
  SCAN_REWARD_VALUE,
  mapScamTypeToReportOption
} from "./services/scamEngine";

// Components
import Badge from "./components/Badge";

// Pages
import OnboardingFlow from "./pages/OnboardingFlow";
import DashboardPage from "./pages/DashboardPage";
import ScannerPage from "./pages/ScannerPage";
import SimulationPage from "./pages/SimulationPage";
import CoachPage from "./pages/CoachPage";
import RadarPage from "./pages/RadarPage";
import SafetyCirclePage from "./pages/SafetyCirclePage";
import LearnPage from "./pages/LearnPage";
import ReportPage from "./pages/ReportPage";
import ProfilePage from "./pages/ProfilePage";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "scanner", label: "Scam Scanner", icon: ScanLine },
  { id: "simulation", label: "Simulation Lab", icon: FlaskConical },
  { id: "coach", label: "AI Scam Coach", icon: MessageCircleQuestion },
  { id: "radar", label: "Scam Radar", icon: Radar },
  { id: "circle", label: "Safety Circle", icon: Users },
  { id: "learn", label: "Learn", icon: GraduationCap },
  { id: "report", label: "Report Scam", icon: Flag },
  { id: "profile", label: "Profile / Settings", icon: Settings },
];

export default function App() {
  const [appPhase, setAppPhase] = useState("loading");
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [guardianMode, setGuardianMode] = useState(false);
  const [language, setLanguage] = useState("English");
  
  // Ollama settings
  const [ollamaHost, setOllamaHost] = useState("/api/ollama");
  const [ollamaModel, setOllamaModel] = useState("llama3");

  // Core metrics
  const [components, setComponents] = useState(null);
  const [missions, setMissions] = useState(MISSIONS);
  const [events, setEvents] = useState(SEED_SCORE_EVENTS);
  const [simRepeats, setSimRepeats] = useState({});
  const [scanRewardCount, setScanRewardCount] = useState(0);
  const [rewardedScanKeys, setRewardedScanKeys] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  
  // Inter-page prefills
  const [pendingCoachQuestion, setPendingCoachQuestion] = useState(null);
  const [reportPrefill, setReportPrefill] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // ---- Hydrate storage ----
  useEffect(() => {
    (async () => {
      const onboarding = await scoreRepository.loadOnboarding();
      const scoreState = await scoreRepository.loadScoreState();
      const history = await scoreRepository.loadScanHistory();
      const ollamaConfig = await scoreRepository.loadOllamaConfig();

      if (history?.length) setScanHistory(history);
      if (ollamaConfig) {
        if (ollamaConfig.host) setOllamaHost(ollamaConfig.host);
        if (ollamaConfig.model) setOllamaModel(ollamaConfig.model);
      }

      if (onboarding?.completed && scoreState?.breakdown) {
        setComponents(scoreState.breakdown);
        setEvents(scoreState.events?.length ? scoreState.events : SEED_SCORE_EVENTS);
        setMissions(scoreState.missions || MISSIONS);
        setSimRepeats(scoreState.simRepeats || {});
        setScanRewardCount(scoreState.scanRewardCount || 0);
        setRewardedScanKeys(scoreState.rewardedScanKeys || []);
        setAppPhase("app");
      } else {
        setAppPhase("onboarding");
      }
      setHydrated(true);
    })();
  }, []);

  // ---- Persist score-relevant state ----
  useEffect(() => {
    if (!hydrated || appPhase !== "app" || !components) return;
    scoreRepository.saveScoreState({
      breakdown: components,
      events,
      missions,
      simRepeats,
      scanRewardCount,
      rewardedScanKeys
    });
  }, [hydrated, appPhase, components, events, missions, simRepeats, scanRewardCount, rewardedScanKeys]);

  // ---- Persist scan history ----
  useEffect(() => {
    if (!hydrated || appPhase !== "app") return;
    scoreRepository.saveScanHistory(scanHistory);
  }, [hydrated, appPhase, scanHistory]);

  // ---- Persist Ollama configurations ----
  useEffect(() => {
    if (!hydrated) return;
    scoreRepository.saveOllamaConfig({ host: ollamaHost, model: ollamaModel });
  }, [hydrated, ollamaHost, ollamaModel]);

  const score = useMemo(() => (components ? calculateImmunityScore(components) : 0), [components]);
  const status = useMemo(() => getScoreStatus(score), [score]);

  const bumpComponent = useCallback((key, delta, reason) => {
    setComponents((prev) => {
      if (!prev) return prev;
      const nextVal = Math.max(0, Math.min(100, prev[key].value + delta));
      return { ...prev, [key]: { ...prev[key], value: nextVal } };
    });
    if (reason && delta !== 0) {
      setEvents((prev) => [makeScoreEvent(key, delta, reason), ...prev]);
    }
  }, []);

  const completeMission = (id) => {
    const mission = missions.find((m) => m.id === id);
    if (!mission || mission.done) return;
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, done: true } : m)));
    bumpComponent(mission.component, mission.gain, `Completed mission: ${mission.title}`);
  };

  const onCompleteSimulation = (scenarioId, passed) => {
    const count = simRepeats[scenarioId] || 0;
    const gain = passed
      ? SIMULATION_PASS_SCHEDULE[Math.min(count, SIMULATION_PASS_SCHEDULE.length - 1)]
      : (count === 0 ? SIMULATION_FIRST_FAIL_PENALTY : 0);
    
    setSimRepeats((prev) => ({ ...prev, [scenarioId]: (prev[scenarioId] || 0) + 1 }));
    if (gain !== 0) {
      bumpComponent(
        "simulationPerformance",
        gain,
        passed 
          ? `Passed simulation: ${scenarioId.replace("-", " ")}` 
          : `Fell for simulation: ${scenarioId.replace("-", " ")}`
      );
    }
  };

  const handleSaveScan = (inputType, inputSummary, result) => {
    const record = {
      id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      inputType,
      inputSummary,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      riskLabel: result.riskLabel,
      scamType: result.scamType,
      timestamp: new Date().toISOString(),
      result,
    };
    setScanHistory((prev) => [record, ...prev].slice(0, 30));

    const contentKey = `${inputType}:${(inputSummary || "").trim().toLowerCase()}`.slice(0, 140);
    const isHighRisk = result.riskLevel === "high" || result.riskLevel === "critical";
    if (isHighRisk && scanRewardCount < SCAN_REWARD_CAP && !rewardedScanKeys.includes(contentKey)) {
      bumpComponent("paymentSafety", SCAN_REWARD_VALUE, `Correctly flagged a ${result.riskLabel.toLowerCase()} ${inputType} scan`);
      setScanRewardCount((c) => c + 1);
      setRewardedScanKeys((prev) => [...prev, contentKey]);
    }
  };

  const handleAskCoachFromScan = (scamType) => {
    const question = scamType && scamType !== "No specific pattern matched"
      ? `Is this a ${scamType.toLowerCase()}? What should I do?`
      : "What should I watch out for in messages like this?";
    setPendingCoachQuestion(question);
    goTo("coach");
  };

  const handleGoReportFromScan = (result) => {
    setReportPrefill({
      type: mapScamTypeToReportOption(result.scamType),
      description: result.explanation ? `Detected via Scam Scanner (risk score ${result.riskScore}/100): ${result.explanation}` : "",
    });
    goTo("report");
  };

  const handleGoSimulationFromScan = () => goTo("simulation");

  const handleOnboardingComplete = async ({ profile, responses, breakdown }) => {
    setComponents(breakdown);
    setEvents(SEED_SCORE_EVENTS);
    await scoreRepository.saveOnboarding({ completed: true, profile, responses });
    await scoreRepository.saveScoreState({
      breakdown,
      events: SEED_SCORE_EVENTS,
      missions: MISSIONS,
      simRepeats: {},
      scanRewardCount: 0,
      rewardedScanKeys: []
    });
    setAppPhase("app");
  };

  const goTo = (id) => {
    setView(id);
    setMobileNavOpen(false);
  };

  if (appPhase === "loading") {
    return (
      <div className="ss-root" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          <span className="ss-spinner" style={{ width: "24px", height: "24px" }} />
          <div>Loading Scam Immunity profile…</div>
        </div>
      </div>
    );
  }

  if (appPhase === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const pageMap = {
    dashboard: (
      <DashboardPage
        components={components}
        score={score}
        status={status}
        showExplain={showExplain}
        setShowExplain={setShowExplain}
        guardianMode={guardianMode}
        events={events}
        missions={missions}
        onStartMission={completeMission}
      />
    ),
    scanner: (
      <ScannerPage
        onSaveScan={handleSaveScan}
        onAskCoach={handleAskCoachFromScan}
        onGoReport={handleGoReportFromScan}
        onGoSimulation={handleGoSimulationFromScan}
        scanHistory={scanHistory}
        ollamaHost={ollamaHost}
        ollamaModel={ollamaModel}
      />
    ),
    simulation: (
      <SimulationPage
        onCompleteSimulation={onCompleteSimulation}
        ollamaHost={ollamaHost}
        ollamaModel={ollamaModel}
      />
    ),
    coach: (
      <CoachPage
        initialQuestion={pendingCoachQuestion}
        onConsumedInitial={() => setPendingCoachQuestion(null)}
        ollamaHost={ollamaHost}
        ollamaModel={ollamaModel}
        userLanguage={language}
      />
    ),
    radar: <RadarPage />,
    circle: <SafetyCirclePage guardianMode={guardianMode} setGuardianMode={setGuardianMode} />,
    learn: <LearnPage missions={missions} onComplete={completeMission} />,
    report: <ReportPage prefill={reportPrefill} onConsumedPrefill={() => setReportPrefill(null)} />,
    profile: (
      <ProfilePage
        language={language}
        setLanguage={setLanguage}
        ollamaHost={ollamaHost}
        setOllamaHost={setOllamaHost}
        ollamaModel={ollamaModel}
        setOllamaModel={setOllamaModel}
      />
    ),
  };

  return (
    <div className="ss-root">
      <aside className={`ss-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="ss-logo">
          <div className="ss-logo-mark"><Shield size={17} color="white" strokeWidth={2.4} /></div>
          <div className="ss-logo-word">ScamShield<span>AI</span></div>
        </div>

        <div className="ss-score-chip">
          <div>
            <div className="ss-score-chip-label">Immunity Score</div>
            <div className="ss-score-chip-num">{score}</div>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        <nav className="ss-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`ss-nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <item.icon size={16} strokeWidth={2.1} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ss-sidebar-foot">
          <label className="ss-guardian-toggle">
            Guardian Mode
            <span className="ss-toggle">
              <input type="checkbox" checked={guardianMode} onChange={(e) => setGuardianMode(e.target.checked)} />
              <span className="ss-toggle-track"><span className="ss-toggle-thumb" /></span>
            </span>
          </label>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div className="ss-topbar">
          <button className="ss-mobile-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="ss-logo">
            <div className="ss-logo-mark"><Shield size={15} color="white" /></div>
            <div className="ss-logo-word">ScamShield<span>AI</span></div>
          </div>
          <div className="ss-score-chip-num" style={{ fontSize: 15 }}>{score}</div>
        </div>
        <main className="ss-main">{pageMap[view]}</main>
      </div>
    </div>
  );
}
