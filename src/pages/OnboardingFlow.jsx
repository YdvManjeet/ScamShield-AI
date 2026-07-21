import React, { useState, useMemo } from "react";
import {
  Shield, ShieldCheck, ShieldAlert, Clock, Lock, ChevronRight, Info, AlertTriangle
} from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import ScoreGauge from "../components/ScoreGauge";
import {
  ONBOARDING_SCENARIOS,
  PROFILE_OPTIONS,
  STRENGTH_NOTES,
  IMPROVEMENT_ACTIONS,
  COMPONENT_LABELS,
  scoreAssessmentResponses,
  calculateImmunityScore,
  getScoreStatus,
  getExplainability
} from "../services/scamEngine";

function OnboardingWelcome({ onStart }) {
  return (
    <div className="ss-onb-shell">
      <Card className="ss-onb-card">
        <div className="ss-onb-logo"><Shield size={26} color="white" strokeWidth={2.3} /></div>
        <h1>Welcome to ScamShield AI</h1>
        <p className="ss-onb-lead">Let's understand how prepared you are against digital scams.</p>
        <div className="ss-onb-facts">
          <div className="ss-onb-fact"><Clock size={15} className="ss-icon-accent" /> Takes about 2 minutes</div>
          <div className="ss-onb-fact"><Lock size={15} className="ss-icon-accent" /> No banking credentials are ever requested</div>
          <div className="ss-onb-fact"><ShieldCheck size={15} className="ss-icon-accent" /> Your results stay private to you</div>
          <div className="ss-onb-fact"><Info size={15} className="ss-icon-accent" /> The score measures preparedness, not intelligence</div>
        </div>
        <button className="ss-btn-primary ss-onb-cta" onClick={onStart}>Start My Safety Check</button>
      </Card>
    </div>
  );
}

function OnboardingProfile({ onNext, onBack }) {
  const [form, setForm] = useState({ ageRange: "", language: "English", digitalComfort: "", activities: [] });

  const toggleActivity = (a) => {
    setForm((f) => ({
      ...f,
      activities: f.activities.includes(a) ? f.activities.filter((x) => x !== a) : [...f.activities, a],
    }));
  };

  const canContinue = form.ageRange && form.digitalComfort;

  return (
    <div className="ss-onb-shell">
      <Card className="ss-onb-card ss-onb-card-wide">
        <button className="ss-link-btn" onClick={onBack}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back</button>
        <h2 style={{ fontSize: 22, marginTop: 6 }}>A little about you</h2>
        <p style={{ marginBottom: 14 }}>Just enough to personalise your results — nothing sensitive.</p>

        <div className="ss-onb-field">
          <div className="ss-label">Age range</div>
          <div className="ss-chip-row">
            {PROFILE_OPTIONS.ageRanges.map((a) => (
              <button key={a} className={`ss-chip ${form.ageRange === a ? "active" : ""}`} onClick={() => setForm({ ...form, ageRange: a })}>{a}</button>
            ))}
          </div>
        </div>

        <div className="ss-onb-field">
          <div className="ss-label">Preferred language</div>
          <select className="ss-select ss-select-full" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            {PROFILE_OPTIONS.languages.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="ss-onb-field">
          <div className="ss-label">Digital comfort</div>
          <div className="ss-chip-row">
            {PROFILE_OPTIONS.digitalComfort.map((d) => (
              <button key={d} className={`ss-chip ${form.digitalComfort === d ? "active" : ""}`} onClick={() => setForm({ ...form, digitalComfort: d })}>{d}</button>
            ))}
          </div>
        </div>

        <div className="ss-onb-field">
          <div className="ss-label">What do you use regularly? (optional)</div>
          <div className="ss-chip-row">
            {PROFILE_OPTIONS.activities.map((a) => (
              <button key={a} className={`ss-chip ${form.activities.includes(a) ? "active" : ""}`} onClick={() => toggleActivity(a)}>{a}</button>
            ))}
          </div>
        </div>

        <button className="ss-btn-primary ss-onb-cta" disabled={!canContinue} onClick={() => onNext(form)}>Continue to Safety Check</button>
      </Card>
    </div>
  );
}

function OnboardingAssessment({ onFinish }) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState(null);

  const scenario = ONBOARDING_SCENARIOS[index];
  const total = ONBOARDING_SCENARIOS.length;
  const progressPct = Math.round(((index + (selected ? 1 : 0)) / total) * 100);

  const choose = (choice) => {
    setSelected(choice);
    setResponses((prev) => [
      ...prev,
      { scenarioId: scenario.id, choiceId: choice.id, category: scenario.category, delta: choice.delta, timestamp: new Date().toISOString() },
    ]);
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      onFinish(responses);
    }
  };

  return (
    <div className="ss-onb-shell">
      <Card className="ss-onb-card ss-onb-card-wide">
        <div className="ss-onb-progress-row">
          <span>Scenario {index + 1} of {total}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="ss-onb-progress-track"><div className="ss-onb-progress-fill" style={{ width: `${progressPct}%` }} /></div>

        <div className="ss-onb-scenario">
          <div className="ss-eyebrow" style={{ marginTop: 14 }}>{scenario.title}</div>
          <p className="ss-onb-prompt">{scenario.prompt}</p>

          {!selected ? (
            <div className="ss-sim-options">
              {scenario.choices.map((c) => (
                <button key={c.id} className="ss-sim-option" onClick={() => choose(c)}>{c.text}</button>
              ))}
            </div>
          ) : (
            <div className="ss-onb-feedback">
              <div className={`ss-onb-feedback-head ${selected.delta > 0 ? "safe" : selected.delta < 0 ? "danger" : ""}`}>
                {selected.delta >= 10 ? <><ShieldCheck size={16} /> Safest response</> : selected.delta > 0 ? <><Info size={16} /> Reasonable, but not the safest</> : <><AlertTriangle size={16} /> This is how the scam succeeds</>}
              </div>
              <p>{selected.explanation}</p>
              <button className="ss-btn-primary ss-onb-cta" onClick={next}>{index + 1 < total ? "Next scenario" : "See my results"}</button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function OnboardingResults({ breakdown, score, status, onFinish }) {
  const [revealed, setRevealed] = useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 250);
    return () => clearTimeout(t);
  }, []);

  const { strengths, weaknesses } = getExplainability(breakdown);

  return (
    <div className="ss-onb-shell">
      <Card className="ss-onb-card ss-onb-card-wide ss-onb-results">
        <div className="ss-eyebrow">Your Scam Immunity Score</div>
        <div className="ss-onb-results-top">
          <ScoreGauge score={revealed ? score : 0} size={168} />
          <div>
            <h2 style={{ fontSize: 26 }}>{score}/100</h2>
            <Badge tone={status.tone} icon={status.tone === "danger" ? ShieldAlert : ShieldCheck}>{status.label}</Badge>
          </div>
        </div>

        <div className="ss-explain-grid" style={{ marginTop: 16 }}>
          <div>
            <div className="ss-explain-label safe">What you did well</div>
            {strengths.map((s) => (
              <div key={s.key} className="ss-explain-row">
                <ShieldCheck size={14} className="ss-icon-safe" />
                <div><strong>{COMPONENT_LABELS[s.key]} — {s.value}</strong><p>{STRENGTH_NOTES[s.key]}</p></div>
              </div>
            ))}
          </div>
          <div>
            <div className="ss-explain-label warning">Areas to improve</div>
            {weaknesses.map((w) => (
              <div key={w.key} className="ss-explain-row">
                <AlertTriangle size={14} className="ss-icon-warning" />
                <div><strong>{COMPONENT_LABELS[w.key]} — {w.value}</strong><p>{IMPROVEMENT_ACTIONS[w.key]}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="ss-onb-recommend">
          <strong>Recommended next step:</strong> {IMPROVEMENT_ACTIONS[weaknesses[0]?.key] || "Keep up your Simulation Lab practice."}
        </div>

        <button className="ss-btn-primary ss-onb-cta" onClick={onFinish}>Improve My Score →</button>
      </Card>
    </div>
  );
}

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState("welcome");
  const [profile, setProfile] = useState(null);
  const [responses, setResponses] = useState(null);
  const breakdown = useMemo(() => (responses ? scoreAssessmentResponses(responses) : null), [responses]);
  const score = useMemo(() => (breakdown ? calculateImmunityScore(breakdown) : 0), [breakdown]);
  const status = useMemo(() => getScoreStatus(score), [score]);

  if (step === "welcome") return <OnboardingWelcome onStart={() => setStep("profile")} />;
  if (step === "profile") return <OnboardingProfile onBack={() => setStep("welcome")} onNext={(p) => { setProfile(p); setStep("assessment"); }} />;
  if (step === "assessment") return <OnboardingAssessment onFinish={(r) => { setResponses(r); setStep("results"); }} />;
  return (
    <OnboardingResults
      breakdown={breakdown}
      score={score}
      status={status}
      onFinish={() => onComplete({ profile, responses, breakdown })}
    />
  );
}
