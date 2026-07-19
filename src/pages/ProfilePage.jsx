import React, { useState, useEffect } from "react";
import { Globe, Bell, Settings, Terminal, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import { ollamaService } from "../services/ollama";

export default function ProfilePage({
  language,
  setLanguage,
  ollamaHost,
  setOllamaHost,
  ollamaModel,
  setOllamaModel
}) {
  const [notif, setNotif] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("untested"); // 'testing' | 'connected' | 'failed'
  const [availableModels, setAvailableModels] = useState([]);
  const [hostInput, setHostInput] = useState(ollamaHost);
  const [errorMessage, setErrorMessage] = useState("");

  const testConnection = async (hostToTest = hostInput) => {
    setConnectionStatus("testing");
    setErrorMessage("");
    try {
      const models = await ollamaService.fetchModels(hostToTest);
      setAvailableModels(models);
      setConnectionStatus("connected");
      setOllamaHost(hostToTest);
      
      // Auto-select first model if current isn't in list or is empty
      if (models.length > 0) {
        const modelNames = models.map(m => m.name);
        if (!ollamaModel || !modelNames.includes(ollamaModel)) {
          setOllamaModel(modelNames[0]);
        }
      }
    } catch (err) {
      setConnectionStatus("failed");
      setErrorMessage(err.message || "Connection refused. Make sure Ollama is running.");
    }
  };

  useEffect(() => {
    testConnection(ollamaHost);
  }, []);

  const handleSaveHost = () => {
    testConnection(hostInput);
  };

  return (
    <div className="ss-page">
      <SectionHeading eyebrow="Profile" title="Settings" />
      
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* General App Settings */}
        <Card>
          <div className="ss-card-title"><Settings size={15} /> General Configuration</div>
          
          <div className="ss-settings-row">
            <div>
              <div className="ss-card-title">Name</div>
              <div className="ss-hint">Anjali (Demo Account)</div>
            </div>
          </div>

          <div className="ss-settings-row">
            <div>
              <div className="ss-card-title"><Globe size={14} /> Language</div>
              <div className="ss-hint">Advisory and coach responses will use this language</div>
            </div>
            <select className="ss-select" style={{ width: "auto" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>हिंदी</option>
              <option>தமிழ்</option>
              <option>తెలుగు</option>
              <option>বাংলা</option>
              <option>मराठी</option>
              <option>ગુજરાતી</option>
              <option>ಕನ್ನಡ</option>
            </select>
          </div>

          <div className="ss-settings-row">
            <div>
              <div className="ss-card-title"><Bell size={14} /> Notifications</div>
              <div className="ss-hint">Alerts for new scams matching your risk profile</div>
            </div>
            <label className="ss-toggle">
              <input type="checkbox" checked={notif} onChange={(e) => setNotif(e.target.checked)} />
              <span className="ss-toggle-track"><span className="ss-toggle-thumb" /></span>
            </label>
          </div>
        </Card>

        {/* Ollama Setup Panel */}
        <Card style={{ borderLeft: "4px solid var(--accent)" }}>
          <div className="ss-card-title"><Terminal size={15} /> Local Ollama LLM Connection</div>
          <p className="ss-hint" style={{ marginBottom: "14px" }}>
            Connect ScamShield AI to your locally running Ollama server to unlock advanced semantic scam analysis, live simulator roleplay, and deep chatbot coaching.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Host Configuration */}
            <div>
              <label className="ss-label" htmlFor="ollama-host">Ollama Server Endpoint</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  id="ollama-host"
                  className="ss-input"
                  placeholder="e.g. http://localhost:11434"
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                />
                <button 
                  className="ss-btn-primary" 
                  style={{ whiteSpace: "nowrap" }}
                  onClick={handleSaveHost}
                  disabled={connectionStatus === "testing"}
                >
                  {connectionStatus === "testing" ? "Testing..." : "Connect"}
                </button>
              </div>
              <span className="ss-hint" style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>
                Use <code>/api/ollama</code> to leverage the built-in Vite dev proxy (recommended to bypass browser CORS).
              </span>
            </div>

            {/* Diagnostics */}
            <div className="ss-settings-row" style={{ padding: "8px 0" }}>
              <div>
                <strong>Connection Status</strong>
              </div>
              <div>
                {connectionStatus === "testing" && <Badge tone="info">Verifying Host...</Badge>}
                {connectionStatus === "connected" && <Badge tone="safe-strong" icon={ShieldCheck}>Active Connected</Badge>}
                {connectionStatus === "failed" && <Badge tone="danger" icon={ShieldAlert}>Connection Offline</Badge>}
                {connectionStatus === "untested" && <Badge tone="info">Untested</Badge>}
              </div>
            </div>

            {/* Model Selector */}
            {connectionStatus === "connected" && (
              <div>
                <label className="ss-label" htmlFor="ollama-model">Active LLM Model</label>
                {availableModels.length > 0 ? (
                  <select 
                    id="ollama-model"
                    className="ss-select"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                  >
                    {availableModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({Math.round(m.size / (1024 * 1024 * 1024) * 10) / 10} GB)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="ss-heuristic-note" style={{ background: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239,68,68,0.15)" }}>
                    <ShieldAlert size={14} style={{ marginRight: "6px", display: "inline" }} />
                    No models found! Run <code>ollama pull llama3</code> in your command line.
                  </div>
                )}
              </div>
            )}

            {/* Setup instructions */}
            {connectionStatus === "failed" && (
              <div className="ss-why-box" style={{ background: "var(--surface-2)", fontSize: "12.5px" }}>
                <strong style={{ color: "var(--warning)", display: "block", marginBottom: "6px" }}>How to start Ollama on your machine:</strong>
                <ol style={{ paddingLeft: "16px", margin: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent-strong)" }}>ollama.com</a>.</li>
                  <li>Open your terminal and pull a model (e.g. <code>ollama pull llama3</code> or <code>ollama pull mistral</code>).</li>
                  <li>
                    Run the model: <code>ollama run llama3</code>.
                  </li>
                  <li>
                    If using a direct local host (not the Vite proxy), configure CORS by running:
                    <br />
                    <code style={{ background: "var(--surface)", padding: "2px 4px", borderRadius: "4px", fontSize: "11.5px", display: "block", marginTop: "4px", border: "1px solid var(--surface-border)" }}>
                      set OLLAMA_ORIGINS=* && ollama serve
                    </code>
                  </li>
                </ol>
                {errorMessage && (
                  <div style={{ color: "var(--danger)", marginTop: "10px", fontSize: "12px", fontFamily: "monospace" }}>
                    Error Detail: {errorMessage}
                  </div>
                )}
                <button 
                  className="ss-btn-secondary" 
                  onClick={() => testConnection(hostInput)} 
                  style={{ marginTop: "12px", width: "auto" }}
                >
                  <RefreshCw size={13} style={{ marginRight: "6px", display: "inline" }} /> Try Reconnecting
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
