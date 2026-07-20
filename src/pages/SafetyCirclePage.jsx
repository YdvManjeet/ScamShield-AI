import React, { useState, useEffect } from "react";
import { 
  Plus, AlertTriangle, ShieldCheck, Trash2, Edit2, X, Check, Mail, 
  Phone, MessageSquare, Share2, Info, Lock, AlertCircle, UserPlus 
} from "lucide-react";
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

  // Form inputs
  const [form, setForm] = useState({ name: "", relation: "", phone: "", email: "", prefMethod: "phone" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", relation: "", phone: "", email: "", prefMethod: "phone" });
  const [editErrors, setEditErrors] = useState({});

  // Contact modal state
  const [activeContactMember, setActiveContactMember] = useState(null);

  useEffect(() => {
    localStorage.setItem("ss:safety-circle", JSON.stringify(members));
  }, [members]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Add Contact logic
  const handleAddMember = (e) => {
    e.preventDefault();
    if (members.length >= 5) {
      showToastMsg("Maximum limit of 5 trusted contacts reached.");
      return;
    }

    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.relation.trim()) errs.relation = "Relationship is required";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) errs.phone = "Enter a valid 10-digit phone number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    const newMember = {
      id: `c_${Date.now()}`,
      name: form.name.trim(),
      relation: form.relation.trim(),
      phone: form.phone.replace(/\s/g, ""),
      email: form.email.trim(),
      prefMethod: form.prefMethod,
      status: "protected",
      lastActivity: "Just added — no suspicious checks logged"
    };

    setMembers((prev) => [...prev, newMember]);
    setForm({ name: "", relation: "", phone: "", email: "", prefMethod: "phone" });
    showToastMsg(`${newMember.name} added to Safety Circle.`);
  };

  // Delete contact logic
  const handleRemoveMember = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your Safety Circle?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      showToastMsg(`${name} removed.`);
    }
  };

  // Edit inline logic
  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm({ ...member });
    setEditErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.name.trim()) errs.name = "Name is required";
    if (!editForm.relation.trim()) errs.relation = "Relationship is required";
    if (!/^\d{10}$/.test(editForm.phone.replace(/\s/g, ""))) errs.phone = "Enter a valid 10-digit phone number";
    if (editForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errs.email = "Enter a valid email address";

    setEditErrors(errs);
    if (Object.keys(errs).length) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              name: editForm.name.trim(),
              relation: editForm.relation.trim(),
              phone: editForm.phone.replace(/\s/g, ""),
              email: editForm.email.trim(),
              prefMethod: editForm.prefMethod
            }
          : m
      )
    );
    setEditingId(null);
    showToastMsg("Contact details updated.");
  };

  // Demo contacts loader
  const handleLoadDemos = () => {
    const demoMembers = [
      { id: "demo_1", name: "Priya Sharma", relation: "Daughter", phone: "9876543210", email: "priya@family.com", prefMethod: "whatsapp", status: "protected", lastActivity: "Checked a suspicious link 1 day ago — safely ignored" },
      { id: "demo_2", name: "Ramesh Sharma", relation: "Father", phone: "9812345678", email: "ramesh@family.com", prefMethod: "phone", status: "protected", lastActivity: "Correctly ended a fake bank KYC call yesterday" },
      { id: "demo_3", name: "Sanjay Patel", relation: "Spouse", phone: "9900998877", email: "sanjay@family.com", prefMethod: "sms", status: "protected", lastActivity: "Scanned a QR refund code — flagged as scam" }
    ];
    setMembers(demoMembers);
    showToastMsg("Hackathon demo contacts loaded successfully.");
  };

  // Contact Dialog Alerts builder
  const handleCopyAlert = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => showToastMsg("Safety alert copied to clipboard."))
      .catch(() => showToastMsg("Failed to copy alert."));
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

  return (
    <div className="ss-page" style={{ position: "relative" }}>
      <SectionHeading
        eyebrow="Safety Circle"
        title="Your Trusted Safety Circle"
        action={
          <label className="ss-toggle">
            <input type="checkbox" checked={guardianMode} onChange={(e) => setGuardianMode(e.target.checked)} />
            <span className="ss-toggle-track"><span className="ss-toggle-thumb" /></span>
            Guardian Mode
          </label>
        }
      />
      
      <p style={{ margin: "-12px 0 6px", fontSize: "14.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
        "Scammers isolate. ScamShield reconnects."
      </p>

      {/* Strict Privacy Protection Card */}
      <Card style={{ background: "rgba(59, 130, 246, 0.05)", border: "1.5px solid var(--surface-border)", borderRadius: "14px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <Lock size={22} className="ss-icon-accent" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>Strict Privacy Commitment</h4>
          <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            To protect your security, ScamShield **never** automatically transmits your private messages, credentials, banking info, screenshots, or scan history to your safety circle. Circle contacts are only alerted when you explicitly choose to copy, share, or call them.
          </p>
        </div>
      </Card>

      {/* Demo helper banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px" }}>
        <span style={{ color: "var(--text-muted)" }}>Presenting at a hackathon? Load dummy family cards instantly.</span>
        <button 
          className="ss-btn-secondary" 
          onClick={handleLoadDemos}
          style={{ width: "auto", margin: 0, padding: "5px 12px", fontSize: "12px", minHeight: "auto" }}
        >
          Load Hackathon Demos
        </button>
      </div>

      {/* Trusted Contacts Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <h3 style={{ fontSize: "16px", color: "var(--text-muted)" }}>Circle Contacts ({members.length} of 5 max)</h3>
        
        {members.length > 0 ? (
          <div className="ss-grid-2">
            {members.map((m) => {
              const isEditing = m.id === editingId;

              if (isEditing) {
                // Inline Edit Form Card
                return (
                  <Card key={m.id} style={{ border: "1px solid var(--accent)", padding: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px", color: "var(--accent-strong)" }}>Editing Contact</strong>
                        <button onClick={cancelEditing} style={{ background: "none", border: "none", color: "var(--text)" }}><X size={16} /></button>
                      </div>
                      
                      <div>
                        <input 
                          className="ss-input" 
                          placeholder="Name" 
                          value={editForm.name} 
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                        />
                        {editErrors.name && <div className="ss-field-error">{editErrors.name}</div>}
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <input 
                            className="ss-input" 
                            placeholder="Relation (e.g. Spouse)" 
                            value={editForm.relation} 
                            onChange={(e) => setEditForm({ ...editForm, relation: e.target.value })} 
                          />
                          {editErrors.relation && <div className="ss-field-error">{editErrors.relation}</div>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            className="ss-input" 
                            placeholder="Phone (10-digits)" 
                            value={editForm.phone} 
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                          />
                          {editErrors.phone && <div className="ss-field-error">{editErrors.phone}</div>}
                        </div>
                      </div>

                      <div>
                        <input 
                          className="ss-input" 
                          placeholder="Email Address (optional)" 
                          value={editForm.email} 
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                        />
                        {editErrors.email && <div className="ss-field-error">{editErrors.email}</div>}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <select 
                          className="ss-select" 
                          style={{ width: "auto" }} 
                          value={editForm.prefMethod} 
                          onChange={(e) => setEditForm({ ...editForm, prefMethod: e.target.value })}
                        >
                          <option value="phone">Prefer Phone Call</option>
                          <option value="sms">Prefer SMS</option>
                          <option value="whatsapp">Prefer WhatsApp</option>
                        </select>
                        <button className="ss-btn-primary" onClick={handleSaveEdit} style={{ padding: "6px 12px", minHeight: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check size={14} /> Save
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              }

              // Standard Contact Card
              return (
                <Card key={m.id} className="ss-member-card" style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "space-between" }}>
                  <div>
                    <div className="ss-member-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div className="ss-avatar" style={{ fontSize: "13px", fontWeight: "700" }}>
                          {m.name.split(" ").map(p => p[0]).join("")}
                        </div>
                        <div>
                          <div className="ss-card-title" style={{ fontSize: "15px", margin: 0 }}>{m.name}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                            {m.relation}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button 
                          aria-label={`Edit ${m.name}`}
                          onClick={() => startEditing(m)} 
                          style={{ background: "none", border: "none", color: "var(--text-muted)", padding: "4px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          aria-label={`Remove ${m.name}`}
                          onClick={() => handleRemoveMember(m.id, m.name)} 
                          style={{ background: "none", border: "none", color: "rgba(239,68,68,0.7)", padding: "4px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12.5px" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <Phone size={11} color="var(--text-muted)" />
                        <span>{m.phone}</span>
                        <span style={{ fontSize: "10px", color: "var(--accent-strong)", marginLeft: "4px" }}>
                          ({m.prefMethod === "phone" ? "Call preferred" : m.prefMethod === "sms" ? "SMS preferred" : "WhatsApp preferred"})
                        </span>
                      </div>
                      {m.email && (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <Mail size={11} color="var(--text-muted)" />
                          <span>{m.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "10px", display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button 
                      className="ss-btn-primary" 
                      style={{ flex: 1, padding: "6px", minHeight: "32px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                      onClick={() => setActiveContactMember(m)}
                    >
                      <Share2 size={11} /> Contact & Alert
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Users} title="Safety Circle Empty" body="Add trusted contacts below to verify requests when you suspect a scam." />
        )}
      </div>

      {/* Add New Contact Form */}
      {members.length < 5 && (
        <Card style={{ marginTop: "12px" }}>
          <div className="ss-card-title" style={{ fontSize: "15px" }}><UserPlus size={15} /> Add a trusted contact</div>
          <form onSubmit={handleAddMember} className="ss-form-grid" style={{ gap: "14px", marginTop: "10px" }}>
            <div>
              <label className="ss-label" htmlFor="name">Name</label>
              <input id="name" className="ss-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="E.g. Priya Sharma" />
              {errors.name && <div className="ss-field-error">{errors.name}</div>}
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="relation">Relationship</label>
                <input id="relation" className="ss-input" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="E.g. Daughter, Spouse" />
                {errors.relation && <div className="ss-field-error">{errors.relation}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="phone">Phone Number</label>
                <input id="phone" className="ss-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
                {errors.phone && <div className="ss-field-error">{errors.phone}</div>}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="email">Email Address (Optional)</label>
                <input id="email" className="ss-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E.g. contact@email.com" />
                {errors.email && <div className="ss-field-error">{errors.email}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="prefMethod">Preferred Contact Method</label>
                <select id="prefMethod" className="ss-select" value={form.prefMethod} onChange={(e) => setForm({ ...form, prefMethod: e.target.value })}>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS Text</option>
                  <option value="whatsapp">WhatsApp chat</option>
                </select>
              </div>
            </div>

            <button className="ss-btn-primary" type="submit" style={{ gridColumn: "1 / -1", width: "100%", marginTop: "6px" }}>
              Add to Safety Circle
            </button>
          </form>
        </Card>
      )}

      {/* Alert Builder Modal overlay */}
      {activeContactMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <Card style={{ maxWidth: "480px", width: "100%", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", display: "flex", gap: "6px", alignItems: "center" }}>
                <Share2 size={16} /> Contact {activeContactMember.name}
              </h3>
              <button onClick={() => setActiveContactMember(null)} style={{ background: "none", border: "none", color: "var(--text)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "var(--surface-2)", borderRadius: "8px", padding: "12px", border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Relation: {activeContactMember.relation}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>Preferred contact: {activeContactMember.prefMethod.toUpperCase()}</div>
            </div>

            {/* Template warning text */}
            <div>
              <label className="ss-label">Alert Template message</label>
              <textarea 
                className="ss-textarea" 
                rows={6}
                readOnly
                value={`ScamShield Safety Alert\n\nI wanted to check a suspicious call or message with you. ScamShield detected potential scam indicators. Please contact me directly to help verify this.`}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a 
                href={`tel:${activeContactMember.phone}`}
                className="ss-btn-primary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none" }}
              >
                <Phone size={14} /> Call Directly (+91 {activeContactMember.phone})
              </a>

              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  className="ss-btn-secondary" 
                  style={{ flex: 1, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  onClick={() => handleCopyAlert(`ScamShield Safety Alert\n\nI wanted to check a suspicious call or message with you. ScamShield detected potential scam indicators. Please contact me directly to help verify this.`)}
                >
                  Copy Text
                </button>
                <button 
                  className="ss-btn-secondary" 
                  style={{ flex: 1, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  onClick={() => handleShareAlert(`ScamShield Safety Alert\n\nI wanted to check a suspicious call or message with you. ScamShield detected potential scam indicators. Please contact me directly to help verify this.`)}
                >
                  <Share2 size={13} /> Share Text
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
