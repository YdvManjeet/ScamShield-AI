import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";

export default function ReportPage({ prefill, onConsumedPrefill }) {
  const [form, setForm] = useState({ type: "", description: "", location: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        type: prefill.type || f.type,
        description: prefill.description || f.description,
      }));
      onConsumedPrefill?.();
    }
  }, [prefill, onConsumedPrefill]);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.type) errs.type = "Select a scam type";
    if (form.description.trim().length < 15) errs.description = "Please describe what happened (15+ characters)";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitted({ ref: `SS-${Math.floor(100000 + Math.random() * 900000)}` });
  };

  if (submitted) {
    return (
      <div className="ss-page">
        <Card className="ss-report-success">
          <CheckCircle2 size={32} className="ss-icon-safe" />
          <h3>Report submitted</h3>
          <p>Reference ID: <strong>{submitted.ref}</strong></p>
          <p className="ss-hint">This report is logged locally. In production, this data feeds the community radar and, for urgent cases, interfaces with cybercrime.gov.in / 1930.</p>
          <button className="ss-btn-secondary" onClick={() => { setSubmitted(null); setForm({ type: "", description: "", location: "" }); }}>Submit another report</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <SectionHeading eyebrow="Community Reporting" title="Report a scam you encountered" />
      <Card>
        <form onSubmit={submit} className="ss-form-stack">
          <div>
            <label className="ss-label" htmlFor="rtype">Scam type</label>
            <select id="rtype" className="ss-select ss-select-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="">Select type</option>
              <option>Digital Arrest / Fake Police Call</option>
              <option>UPI / Payment Fraud</option>
              <option>QR Code Scam</option>
              <option>Fake KYC / SIM Block</option>
              <option>Courier / Parcel Scam</option>
              <option>Investment Scam</option>
              <option>Job Scam</option>
              <option>Other</option>
            </select>
            {errors.type && <div className="ss-field-error">{errors.type}</div>}
          </div>
          <div>
            <label className="ss-label" htmlFor="rdesc">What happened</label>
            <textarea id="rdesc" className="ss-textarea" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <div className="ss-field-error">{errors.description}</div>}
          </div>
          <div>
            <label className="ss-label" htmlFor="rloc">Location (optional)</label>
            <input id="rloc" className="ss-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / state" />
          </div>
          <button className="ss-btn-primary" type="submit">Submit report</button>
        </form>
      </Card>
    </div>
  );
}
