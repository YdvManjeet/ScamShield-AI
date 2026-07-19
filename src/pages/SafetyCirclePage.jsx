import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import Toast from "../components/Toast";
import { SAFETY_CIRCLE_SEED } from "../services/scamEngine";

export default function SafetyCirclePage({ guardianMode, setGuardianMode }) {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("ss:safety-circle");
    return saved ? JSON.parse(saved) : SAFETY_CIRCLE_SEED;
  });
  const [form, setForm] = useState({ name: "", relation: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("ss:safety-circle", JSON.stringify(members));
  }, [members]);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.relation.trim()) errs.relation = "Relation is required";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) errs.phone = "Enter a valid 10-digit phone number";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    
    setMembers((m) => [
      ...m,
      { id: `c${Date.now()}`, ...form, status: "protected", lastActivity: "Just added — no activity yet" }
    ]);
    setForm({ name: "", relation: "", phone: "" });
    setToast(`${form.name} added to your Safety Circle`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="ss-page">
      <SectionHeading
        eyebrow="Trusted Safety Circle"
        title="Watch over family members' scam exposure"
        action={
          <label className="ss-toggle">
            <input type="checkbox" checked={guardianMode} onChange={(e) => setGuardianMode(e.target.checked)} />
            <span className="ss-toggle-track"><span className="ss-toggle-thumb" /></span>
            Guardian Mode
          </label>
        }
      />

      <div className="ss-grid-2">
        {members.map((m) => (
          <Card key={m.id} className="ss-member-card">
            <div className="ss-member-top">
              <div className="ss-avatar">{m.name.split(" ").map((p) => p[0]).join("")}</div>
              <div>
                <div className="ss-card-title">{m.name}</div>
                <div className="ss-radar-meta">{m.relation} · {m.phone}</div>
              </div>
              <Badge tone={m.status === "at-risk" ? "warning" : "safe"} icon={m.status === "at-risk" ? AlertTriangle : ShieldCheck}>
                {m.status === "at-risk" ? "At risk" : "Protected"}
              </Badge>
            </div>
            <p className="ss-member-activity">{m.lastActivity}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="ss-card-title"><Plus size={15} /> Add a family member</div>
        <form onSubmit={submit} className="ss-form-grid">
          <div>
            <label className="ss-label" htmlFor="mname">Name</label>
            <input id="mname" className="ss-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <div className="ss-field-error">{errors.name}</div>}
          </div>
          <div>
            <label className="ss-label" htmlFor="mrelation">Relation</label>
            <input id="mrelation" className="ss-input" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="e.g. Mother" />
            {errors.relation && <div className="ss-field-error">{errors.relation}</div>}
          </div>
          <div>
            <label className="ss-label" htmlFor="mphone">Phone number</label>
            <input id="mphone" className="ss-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
            {errors.phone && <div className="ss-field-error">{errors.phone}</div>}
          </div>
          <button className="ss-btn-primary" type="submit">Add to Safety Circle</button>
        </form>
      </Card>
      <Toast toast={toast} />
    </div>
  );
}
