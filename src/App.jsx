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
import PrivacyPage from "./pages/PrivacyPage";
import MissionModal from "./components/MissionModal";

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
  const [ollamaModel, setOllamaModel] = useState("llama3.2");

  // Core metrics
  const [components, setComponents] = useState(null);
  const [missions, setMissions] = useState(MISSIONS);
  const [events, setEvents] = useState(SEED_SCORE_EVENTS);
  const [simRepeats, setSimRepeats] = useState({});
  const [scanHistory, setScanHistory] = useState([]);
  
  // Gamification & Learning Metrics
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(3); // default 3 days
  const [badges, setBadges] = useState(["scam-resistant"]);
  const [scanRewardCount, setScanRewardCount] = useState(0);
  const [rewardedScanKeys, setRewardedScanKeys] = useState([]);
  
  // Inter-page prefills
  const [pendingCoachQuestion, setPendingCoachQuestion] = useState(null);
  const [reportPrefill, setReportPrefill] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeMission, setActiveMission] = useState(null);

  const activeNavItems = useMemo(() => {
    if (!guardianMode) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) =>
      ["dashboard", "coach", "circle", "profile"].includes(item.id)
    );
  }, [guardianMode]);

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
        setXp(scoreState.xp || 0);
        setStreak(scoreState.streak || 3);
        setBadges(scoreState.badges || ["scam-resistant"]);
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
      rewardedScanKeys,
      xp,
      streak,
      badges
    });
  }, [hydrated, appPhase, components, events, missions, simRepeats, scanRewardCount, rewardedScanKeys, xp, streak, badges]);

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
    
    // Reward XP, Streak & Badges
    setXp((prev) => prev + 150);
    setStreak((prev) => prev + 1);
    setBadges((prev) => {
      const next = [...prev];
      if (id === "m1" && !next.includes("digital-arrest-defender")) {
        next.push("digital-arrest-defender");
      }
      if (id === "m2" && !next.includes("upi-guardian")) {
        next.push("upi-guardian");
      }
      if (id === "m5" && !next.includes("phishing-spotter")) {
        next.push("phishing-spotter");
      }
      // Count total completed including this one
      const completedCount = missions.filter(m => m.done || m.id === id).length;
      if (completedCount >= 2 && !next.includes("family-protector")) {
        next.push("family-protector");
      }
      if (completedCount >= 4 && !next.includes("scam-resistant")) {
        next.push("scam-resistant");
      }
      return next;
    });
  };

  const handleStartMission = useCallback((id) => {
    const m = missions.find((item) => item.id === id);
    if (m) {
      setActiveMission(m);
    }
  }, [missions]);

  const handleResetMissions = useCallback(() => {
    setMissions((prev) => prev.map((m) => ({ ...m, done: false })));
  }, []);

  const onCompleteSimulation = (scenarioId, passed, scoreVal = 0) => {
    const currentRecord = simRepeats[scenarioId];
    const count = currentRecord && typeof currentRecord === "object"
      ? (currentRecord.attempts || 0)
      : (currentRecord || 0);

    const newAttempts = count + 1;
    const previousBest = currentRecord && typeof currentRecord === "object"
      ? (currentRecord.bestScore || 0)
      : (passed ? 100 : 0);
    const newBestScore = Math.max(previousBest, scoreVal);

    setSimRepeats((prev) => ({
      ...prev,
      [scenarioId]: {
        attempts: newAttempts,
        bestScore: newBestScore,
        latestScore: scoreVal,
        completed: true,
        passed: passed
      }
    }));

    // Balanced score adjustments
    if (passed) {
      if (count === 0) {
        bumpComponent("simulationPerformance", 6, `Passed simulation: ${scenarioId.replace("-", " ")}`);
        bumpComponent("awareness", 3, `Developed awareness in: ${scenarioId.replace("-", " ")}`);
        bumpComponent("responseReadiness", 2, `Improved response readiness in: ${scenarioId.replace("-", " ")}`);
      } else if (count === 1) {
        bumpComponent("simulationPerformance", 3, `Retried and passed simulation: ${scenarioId.replace("-", " ")}`);
        bumpComponent("awareness", 1, `Reinforced awareness in: ${scenarioId.replace("-", " ")}`);
        bumpComponent("responseReadiness", 1, `Reinforced response readiness in: ${scenarioId.replace("-", " ")}`);
      } else if (count === 2) {
        bumpComponent("simulationPerformance", 1, `Replayed simulation: ${scenarioId.replace("-", " ")}`);
      }
    } else {
      if (count === 0) {
        bumpComponent("simulationPerformance", -4, `Fell for simulation: ${scenarioId.replace("-", " ")}`);
      }
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

  const handleAskCoachFromScan = (result) => {
    if (result && typeof result === "object") {
      const org = result.scamType || "an unknown source";
      const score = result.riskScore || 0;
      setPendingCoachQuestion({
        query: `I analyzed this message claiming to be from ${org} and found a ${score}% risk score. Explain why.`,
        context: {
          scamType: result.scamType,
          riskScore: result.riskScore,
          explanation: result.explanation
        }
      });
    } else {
      const questionText = result && result !== "No specific pattern matched"
        ? `Is this a ${result.toLowerCase()}? What should I do?`
        : "What should I watch out for in messages like this?";
      setPendingCoachQuestion(questionText);
    }
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
    setMissions(MISSIONS);
    setSimRepeats({});
    setScanRewardCount(0);
    setRewardedScanKeys([]);
    setXp(0);
    setStreak(3);
    setBadges(["scam-resistant"]);
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

  const [prefilledScannerText, setPrefilledScannerText] = useState("");

  const goTo = (id) => {
    setView(id);
    setMobileNavOpen(false);
    if (id !== "scanner") setPrefilledScannerText("");
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
        setGuardianMode={setGuardianMode}
        goTo={goTo}
        events={events}
        missions={missions}
        onStartMission={handleStartMission}
        xp={xp}
        streak={streak}
        badges={badges}
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
        guardianMode={guardianMode}
        prefilledText={prefilledScannerText}
      />
    ),
    simulation: (
      <SimulationPage
        onCompleteSimulation={onCompleteSimulation}
        simRepeats={simRepeats}
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
    radar: <RadarPage goTo={goTo} />,
    circle: <SafetyCirclePage />,
    learn: (
      <LearnPage
        missions={missions}
        onComplete={handleStartMission}
        onResetMissions={handleResetMissions}
        components={components}
        xp={xp}
        streak={streak}
        badges={badges}
      />
    ),
    report: <ReportPage prefill={reportPrefill} onConsumedPrefill={() => setReportPrefill(null)} />,
    profile: (
      <ProfilePage
        language={language}
        setLanguage={setLanguage}
        ollamaHost={ollamaHost}
        setOllamaHost={setOllamaHost}
        ollamaModel={ollamaModel}
        setOllamaModel={setOllamaModel}
        guardianMode={guardianMode}
        setGuardianMode={setGuardianMode}
      />
    ),
    privacy: <PrivacyPage />,
  };



  return (
    <div className={`ss-root ${guardianMode ? "ss-guardian-active" : ""}`}>
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
          {activeNavItems.map((item) => (
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

        <div className="ss-sidebar-foot" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "stretch" }}>
          <button
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--surface-border)",
              color: "var(--text-muted)",
              fontSize: "12px",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              textAlign: "center",
              display: "block",
              width: "100%",
              fontWeight: "600"
            }}
            onClick={() => goTo("privacy")}
          >
            🛡️ Privacy Center
          </button>
          
          <label className="ss-guardian-toggle" style={{ marginTop: "4px" }}>
            Guardian Mode
            <span className="ss-toggle">
              <input type="checkbox" checked={guardianMode} onChange={(e) => setGuardianMode(e.target.checked)} />
              <span className="ss-toggle-track"><span className="ss-toggle-thumb" /></span>
            </span>
          </label>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Navigation / Header Area */}
        <div className="ss-topbar">
          <button className="ss-mobile-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="ss-logo">
            <div className="ss-logo-mark"><Shield size={15} color="white" /></div>
            <div className="ss-logo-word">ScamShield<span>AI</span></div>
          </div>
          
          {/* Mobile Guardian Button Toggle */}
          <button
            onClick={() => setGuardianMode(!guardianMode)}
            style={{ 
              background: guardianMode ? "var(--warning)" : "var(--surface-2)", 
              border: "1px solid var(--surface-border)", 
              borderRadius: "6px", 
              padding: "4px 8px", 
              fontSize: "10.5px", 
              fontWeight: "700", 
              color: guardianMode ? "black" : "var(--text)" 
            }}
          >
            {guardianMode ? "🛡️ Guardian" : "Normal"}
          </button>

          <div className="ss-score-chip-num" style={{ fontSize: 15 }}>{score}</div>
        </div>



        {/* Content Box */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
          <main className="ss-main" style={{ flex: 1, paddingBottom: "34px" }}>
            {pageMap[view]}
          </main>
          
          {/* Trust Disclaimer and Privacy Footer */}
          <footer style={{ 
            padding: "20px 34px", 
            borderTop: "1px solid var(--surface-border)", 
            fontSize: "11px", 
            color: "var(--text-muted)", 
            textAlign: "center", 
            lineHeight: "1.5" 
          }}>
            <div>
              🛡️ <strong>Trust Advisory:</strong> ScamShield AI provides automated risk evaluations and safety learning scenarios. It does not replace official emergency services or direct police alerts. If you are experiencing a live fraud incident, please contact the official national Cyber Crime Helpline immediately at <strong>1930</strong> or report details to <strong>cybercrime.gov.in</strong>.
            </div>
            <div style={{ marginTop: "4px" }}>
              ScamShield is an independent educational tool. We are not affiliated with the CBI, RBI, Police, NCRB, or the Government of India. All personal logs remain encrypted locally in browser storage.
            </div>
          </footer>
        </div>
      </div>
      {activeMission && (
        <MissionModal
          mission={activeMission}
          onClose={() => setActiveMission(null)}
          onComplete={completeMission}
        />
      )}
    </div>
  );
}


