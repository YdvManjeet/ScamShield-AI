import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Trash2, Camera, Brain, Lock } from "lucide-react";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import Badge from "../components/Badge";
import { reportExtractor } from "../services/reportExtractor";

export default function ReportPage({ prefill, onConsumedPrefill }) {
  const [form, setForm] = useState({
    type: "",
    channel: "",
    org: "",
    phone: "",
    upi: "",
    url: "",
    description: "",
    location: "",
    screenshot: null
  });

  const [screenshotPreview, setScreenshotPreview] = useState(null);
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

  // Reactive extraction based on description content
  const extractedData = useMemo(() => {
    return reportExtractor.extractScamData(form.description);
  }, [form.description]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, screenshot: file });
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const removeScreenshot = () => {
    setForm({ ...form, screenshot: null });
    setScreenshotPreview(null);
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.type) errs.type = "Please select a scam category";
    if (!form.channel) errs.channel = "Please select the communication channel";
    if (form.description.trim().length < 15) {
      errs.description = "Please describe what happened in detail (minimum 15 characters)";
    }
    
    // Validate optional inputs
    if (form.phone.trim() && !/^\d{10,12}$/.test(form.phone.replace(/\s/g, ""))) {
      errs.phone = "Enter a valid 10-12 digit phone number";
    }
    if (form.upi.trim() && !/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/.test(form.upi)) {
      errs.upi = "Enter a valid UPI ID (e.g. name@bank)";
    }

    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Simulate database record entry
    setSubmitted({ ref: `SS-${Math.floor(100000 + Math.random() * 900000)}` });
  };

  if (submitted) {
    return (
      <div className="ss-page" style={{ animation: "fadeIn 0.3s ease" }}>
        <Card className="ss-report-success" style={{ textAlign: "center", padding: "40px 20px" }}>
          <CheckCircle2 size={48} color="var(--safe-strong)" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", margin: "0 0 10px" }}>Scam Report Logged Successfully</h2>
          <p>Your incident reference ID is: <strong style={{ color: "var(--accent-strong)", fontSize: "18px" }}>{submitted.ref}</strong></p>
          <p className="ss-hint" style={{ maxWidth: "540px", margin: "14px auto", lineHeight: 1.5 }}>
            Thank you for helping protect the community. This data is processed anonymously to cluster potential scam campaign patterns and update the live Scam Radar.
          </p>
          <button 
            className="ss-btn-primary" 
            style={{ width: "auto", marginTop: "14px" }}
            onClick={() => { 
              setSubmitted(null); 
              setForm({ type: "", channel: "", org: "", phone: "", upi: "", url: "", description: "", location: "", screenshot: null });
              setScreenshotPreview(null);
            }}
          >
            Submit Another Report
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="ss-page" style={{ animation: "fadeIn 0.3s ease" }}>
      <SectionHeading eyebrow="Community Reporting" title="Report a Scam Incident" />

      <div className="ss-grid-2" style={{ gap: "24px" }}>
        {/* Left Column: Input Form */}
        <Card style={{ padding: "24px" }}>
          <form onSubmit={submit} className="ss-form-stack" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Category selection */}
            <div>
              <label className="ss-label" htmlFor="type">Scam Category</label>
              <select id="type" className="ss-select ss-select-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">Select Category</option>
                <option value="Digital Arrest / Government Impersonation">Digital Arrest / Fake Official Call</option>
                <option value="UPI / Payment Fraud">UPI / Money Transfer Fraud</option>
                <option value="QR Code Scam">QR Code Refund Trick</option>
                <option value="Fake KYC / SIM Block">Fake KYC / SIM Card Block Warning</option>
                <option value="Courier / Parcel Scam">Courier / Customs Clearance Scam</option>
                <option value="Investment / Job Scam">Fake Investment WhatsApp Group / Job Scam</option>
                <option value="Other">Other Scam Pattern</option>
              </select>
              {errors.type && <div className="ss-field-error">{errors.type}</div>}
            </div>

            {/* Communication channel selector */}
            <div>
              <label className="ss-label" htmlFor="channel">How did they contact you?</label>
              <select id="channel" className="ss-select ss-select-full" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="">Select Channel</option>
                <option value="Call">Phone Call (Voice)</option>
                <option value="SMS">SMS Text Message</option>
                <option value="WhatsApp">WhatsApp Message / Call</option>
                <option value="Telegram">Telegram Channel / Group</option>
                <option value="Email">Email</option>
                <option value="Website">Suspicious Website</option>
                <option value="Other">Other</option>
              </select>
              {errors.channel && <div className="ss-field-error">{errors.channel}</div>}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {/* Claimed Organization */}
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="org">Claimed Organization</label>
                <input id="org" className="ss-input" placeholder="E.g. CBI, SBI, Customs" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
              </div>
              
              {/* Location */}
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="location">City / District (optional)</label>
                <input id="location" className="ss-input" placeholder="E.g. Gurugram" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {/* Phone number */}
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="phone">Scammer's Phone (optional)</label>
                <input id="phone" className="ss-input" placeholder="10-digit number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <div className="ss-field-error">{errors.phone}</div>}
              </div>
              
              {/* UPI ID */}
              <div style={{ flex: 1 }}>
                <label className="ss-label" htmlFor="upi">Scammer's UPI ID (optional)</label>
                <input id="upi" className="ss-input" placeholder="E.g. refund@ybl" value={form.upi} onChange={(e) => setForm({ ...form, upi: e.target.value })} />
                {errors.upi && <div className="ss-field-error">{errors.upi}</div>}
              </div>
            </div>

            {/* Suspicious URL */}
            <div>
              <label className="ss-label" htmlFor="url">Suspicious Web Link / URL (optional)</label>
              <input id="url" className="ss-input" placeholder="E.g. http://secure-kyc-verify.com" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>

            {/* Description */}
            <div>
              <label className="ss-label" htmlFor="description">Describe what happened</label>
              <textarea 
                id="description" 
                className="ss-textarea" 
                rows={4} 
                placeholder="Include what they said, what they requested, and any demands. Do not paste OTPs or passwords."
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
              />
              {errors.description && <div className="ss-field-error">{errors.description}</div>}
            </div>

            {/* Evidence screenshot uploader */}
            <div>
              <label className="ss-label">Evidence Screenshot (optional)</label>
              {!screenshotPreview ? (
                <div 
                  style={{ border: "2px dashed var(--surface-border)", borderRadius: "10px", padding: "16px", textAlign: "center", cursor: "pointer", background: "var(--surface-2)" }}
                  onClick={() => document.getElementById("file-select").click()}
                >
                  <Camera size={20} color="var(--text-muted)" style={{ margin: "0 auto 6px" }} />
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Click to attach screenshot evidence</span>
                  <input id="file-select" type="file" accept="image/*" hidden onChange={handleFileChange} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", border: "1px solid var(--surface-border)", padding: "8px 12px", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src={screenshotPreview} alt="Screenshot evidence preview" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                    <span style={{ fontSize: "13px" }}>{form.screenshot.name.slice(0, 18)}...</span>
                  </div>
                  <button type="button" onClick={removeScreenshot} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <button className="ss-btn-primary" type="submit" style={{ padding: "12px", fontSize: "16px", minHeight: "48px" }}>
              Submit Scam Report
            </button>
          </form>
        </Card>

        {/* Right Column: Privacy Commitment & AI Extracted Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Privacy Alert banner */}
          <Card style={{ background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.25)", borderRadius: "14px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <Lock size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ fontSize: "14px", color: "var(--danger)" }}>⚠️ Strict Privacy Shield</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45 }}>
                Do not upload passwords, OTP verification codes, bank PIN numbers, or unnecessary sensitive personal information. All reports are indexed anonymously.
              </p>
            </div>
          </Card>

          {/* AI Extracted preview panel */}
          <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", border: "1px solid var(--accent)", background: "rgba(59, 130, 246, 0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-border)", paddingBottom: "10px" }}>
              <Brain size={20} className="ss-icon-accent" />
              <h3 style={{ fontSize: "16px", margin: 0 }}>AI Extracted Intelligence Preview</h3>
            </div>

            {extractedData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Likely Scam Type:</span>
                  <div style={{ fontWeight: "700", marginTop: "2px", color: "var(--warning)" }}>{extractedData.scamType}</div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Claimed Authority:</span>
                  <div style={{ fontWeight: "600", marginTop: "2px" }}>{extractedData.claimedAuthority}</div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Urgency Level / Tactic:</span>
                  <div style={{ fontWeight: "600", marginTop: "2px" }}>{extractedData.urgencyLanguage}</div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)" }}>Payment Method:</span>
                  <div style={{ fontWeight: "600", marginTop: "2px" }}>{extractedData.paymentMethod}</div>
                </div>

                {/* Extracted Identifiers */}
                {(extractedData.phones.length > 0 || extractedData.upis.length > 0 || extractedData.domains.length > 0) && (
                  <div style={{ marginTop: "6px", borderTop: "1px dashed var(--surface-border)", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <strong style={{ fontSize: "12px", color: "var(--accent-strong)" }}>Extracted Identifiers:</strong>
                    
                    {extractedData.phones.length > 0 && (
                      <div>📞 Phones: {extractedData.phones.map((p, idx) => <Badge key={idx} tone="warning" style={{ marginLeft: "4px" }}>{p}</Badge>)}</div>
                    )}
                    
                    {extractedData.upis.length > 0 && (
                      <div>💳 UPI: {extractedData.upis.map((u, idx) => <Badge key={idx} tone="warning" style={{ marginLeft: "4px" }}>{u}</Badge>)}</div>
                    )}
                    
                    {extractedData.domains.length > 0 && (
                      <div>🌐 Domains: {extractedData.domains.map((d, idx) => <Badge key={idx} tone="warning" style={{ marginLeft: "4px" }}>{d}</Badge>)}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "13px" }}>
                Begin typing a description on the left to view extracted safety intelligence indicators.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
