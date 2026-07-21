import React, { useState, useEffect, useRef } from "react";
import { Send, Trash2, ShieldAlert } from "lucide-react";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import { AIProvider } from "../services/aiProvider";
import { ollamaService } from "../services/ollama";

const STARTER_QUESTIONS = {
  English: [
    { text: "Someone claiming to be CBI called me.", label: "CBI Call Threat" },
    { text: "Do I need a UPI PIN to receive money?", label: "UPI PIN Rule" },
    { text: "Someone is threatening to arrest me.", label: "Arrest Threat" },
    { text: "Is this investment message suspicious?", label: "Investment Scam" },
    { text: "I installed a screen-sharing app. What should I do?", label: "Screen Share Danger" }
  ],
  Hindi: [
    { text: "सीबीआई अधिकारी बनकर किसी ने फोन किया।", label: "सीबीआई कॉल धमकी" },
    { text: "क्या पैसे प्राप्त करने के लिए यूपीआई पिन चाहिए?", label: "यूपीआई पिन नियम" },
    { text: "कोई मुझे गिरफ्तार करने की धमकी दे रहा है।", label: "अरेस्ट धमकी" },
    { text: "क्या यह निवेश का संदेश संदिग्ध है?", label: "निवेश घोटाला" },
    { text: "मैंने स्क्रीन शेयर ऐप इंस्टॉल किया है। मैं क्या करूँ?", label: "स्क्रीन शेयर खतरा" }
  ]
};

export default function CoachPage({
  initialQuestion,
  onConsumedInitial,
  ollamaHost,
  ollamaModel,
  userLanguage = "English"
}) {
  const [language, setLanguage] = useState(userLanguage || "English");
  const languageNormalized = language === "Hindi" || language === "हिंदी" ? "Hindi" : "English";

  const getWelcomeMessage = (lang) => {
    return (lang === "Hindi" || lang === "हिंदी")
      ? "नमस्ते, मैं आपका स्कैमशील्ड एआई कोच हूँ। आप मुझसे किसी भी डिजिटल धोखाधड़ी, जैसे डिजिटल अरेस्ट, यूपीआई क्यूआर घोटाले, नकली केवाईसी या संदिग्ध संदेशों के बारे में पूछ सकते हैं। सुरक्षा संबंधी सलाह के लिए नीचे दिए गए प्रश्नों पर क्लिक करें या अपना प्रश्न टाइप करें।"
      : "Hello, I am your ScamShield AI Coach. Ask me about any suspicious situation: digital arrest calls, UPI fraud, fake KYC blocking, investment WhatsApp groups, or how to stay safe. Click a question below or type your own:";
  };

  const [messages, setMessages] = useState([
    {
      from: "coach",
      text: getWelcomeMessage(userLanguage || "English"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const threadEndRef = useRef(null);

  // Sync initial welcome message if user flips language switcher
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setMessages((prev) => {
      // If we only have the welcome message, swap it out
      if (prev.length === 1 && prev[0].from === "coach") {
        return [{ from: "coach", text: getWelcomeMessage(newLang) }];
      }
      return prev;
    });
  };

  useEffect(() => {
    // Check if Ollama is available on host change
    ollamaService.fetchModels(ollamaHost)
      .then((models) => setOllamaAvailable(models && models.length > 0))
      .catch(() => setOllamaAvailable(false));
  }, [ollamaHost]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuestion) {
      if (typeof initialQuestion === "object") {
        handleAskCoach(initialQuestion.query, initialQuestion.context);
      } else {
        handleAskCoach(initialQuestion);
      }
      onConsumedInitial?.();
    }
  }, [initialQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAskCoach = async (query, context = null) => {
    if (!query.trim()) return;

    const userMsg = { from: "user", text: query, context };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Format chat history for prompt context
      const historyFormatted = messages.map(m => ({
        from: m.from,
        text: m.text
      }));

      const coachResponse = await AIProvider.getCoachResponse(
        historyFormatted,
        query,
        language,
        context,
        ollamaHost,
        ollamaModel
      );

      setMessages((prev) => [
        ...prev,
        { 
          from: "coach", 
          text: coachResponse.text,
          isUrgentOverride: coachResponse.isUrgentOverride,
          source: coachResponse.source
        }
      ]);
    } catch (err) {
      console.error("Coach prompt failed:", err);
      const fallbackWarning = languageNormalized === "Hindi"
        ? "⚠️ त्रुटि: स्कैम कोच अभी ऑफ़लाइन है। याद रखें: कभी भी ओटीपी या यूपीआई पिन किसी से साझा न करें। यदि कोई तत्काल पैसे ट्रांसफर करने को कहे, तो मना कर दें।"
        : "⚠️ Error: Scam Coach offline. Always remember: Never share OTPs or UPI PINs. If someone demands an urgent payment, refuse and disconnect.";
      
      setMessages((prev) => [
        ...prev,
        { from: "coach", text: fallbackWarning }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    handleAskCoach(input);
  };

  const handleClearChat = () => {
    if (window.confirm(languageNormalized === "Hindi" ? "क्या आप चैट इतिहास मिटाना चाहते हैं?" : "Clear chat history?")) {
      setMessages([{ from: "coach", text: getWelcomeMessage(language) }]);
      setInput("");
    }
  };

  const starters = STARTER_QUESTIONS[languageNormalized] || STARTER_QUESTIONS.English;

  return (
    <div className="ss-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "10px" }}>
        <SectionHeading eyebrow="AI Scam Coach" title="ScamShield AI Coach" />
        
        {/* Multilingual Switcher Header */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
          <button 
            className={`ss-btn-secondary ${languageNormalized === "English" ? "active" : ""}`}
            style={{ 
              width: "auto", 
              margin: 0, 
              padding: "6px 12px", 
              fontSize: "12px", 
              minHeight: "auto",
              background: languageNormalized === "English" ? "var(--accent)" : "var(--surface-2)",
              color: languageNormalized === "English" ? "white" : "var(--text)"
            }}
            onClick={() => handleLanguageChange("English")}
          >
            English
          </button>
          <button 
            className={`ss-btn-secondary ${languageNormalized === "Hindi" ? "active" : ""}`}
            style={{ 
              width: "auto", 
              margin: 0, 
              padding: "6px 12px", 
              fontSize: "12px", 
              minHeight: "auto",
              background: languageNormalized === "Hindi" ? "var(--accent)" : "var(--surface-2)",
              color: languageNormalized === "Hindi" ? "white" : "var(--text)"
            }}
            onClick={() => handleLanguageChange("Hindi")}
          >
            हिन्दी
          </button>
        </div>
      </div>

      <Card className="ss-coach-card" style={{ display: "flex", flexDirection: "column", minHeight: "480px" }}>
        
        {/* Connection status header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", padding: "0 0 12px 0", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
            <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: ollamaAvailable ? "var(--safe-strong)" : "var(--warning)" }} />
            <span style={{ color: "var(--text-muted)" }}>
              {ollamaAvailable ? `Connected to local LLM: ${ollamaModel}` : "Running in local Fraud Detection Rule Mode"}
            </span>
          </div>
          <button 
            style={{ background: "none", border: "none", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "12px" }}
            onClick={handleClearChat}
          >
            <Trash2 size={13} /> {languageNormalized === "Hindi" ? "चैट साफ़ करें" : "Clear Chat"}
          </button>
        </div>

        {/* Chat Thread */}
        <div className="ss-coach-thread" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", padding: "10px" }}>
          {messages.map((m, i) => {
            const isCoach = m.from === "coach";
            return (
              <div 
                key={i} 
                className={`ss-coach-msg ss-coach-${m.from}`}
                style={{
                  alignSelf: isCoach ? "flex-start" : "flex-end",
                  background: isCoach ? "var(--surface-2)" : "var(--accent-dim)",
                  border: isCoach 
                    ? (m.isUrgentOverride ? "2px solid var(--danger)" : "1px solid var(--surface-border)") 
                    : "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  fontSize: "14.5px",
                  lineHeight: "1.55"
                }}
              >
                {/* Urgent flashing warning banner inside bubble */}
                {isCoach && m.isUrgentOverride && (
                  <div style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", marginBottom: "8px", background: "rgba(239,68,68,0.1)", padding: "6px 10px", borderRadius: "6px" }}>
                    <ShieldAlert size={16} /> {languageNormalized === "Hindi" ? "तत्काल सुरक्षा चेतावनी" : "CRITICAL FRAUD WARNING"}
                  </div>
                )}

                <div>{m.text}</div>

                {/* Structured context card attached to user query */}
                {!isCoach && m.context && (
                  <div style={{ 
                    marginTop: "10px", 
                    background: "rgba(245, 158, 11, 0.08)", 
                    border: "1px dashed rgba(245, 158, 11, 0.35)", 
                    borderRadius: "8px", 
                    padding: "10px", 
                    fontSize: "12.5px", 
                    color: "white",
                    textAlign: "left"
                  }}>
                    <div style={{ fontWeight: "700", color: "var(--warning)", marginBottom: "4px" }}>📊 Attached Scan Context:</div>
                    <div><strong>Risk Score:</strong> {m.context.riskScore}/100</div>
                    <div><strong>Likely Pattern:</strong> {m.context.scamType}</div>
                    {m.context.explanation && <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>{m.context.explanation}</div>}
                  </div>
                )}
              </div>
            );
          })}
          
          {loading && (
            <div className="ss-coach-msg ss-coach-coach" style={{ alignSelf: "flex-start", background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "14px", padding: "12px 16px", display: "flex", gap: "8px", alignItems: "center", fontSize: "14px" }}>
              <span className="ss-spinner" style={{ width: "12px", height: "12px" }} />
              <span>{languageNormalized === "Hindi" ? "कोच जवाब लिख रहे हैं..." : "AI Coach is analyzing..."}</span>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Starter Questions Grid (shows when chat history contains only the welcome bubble) */}
        {messages.length === 1 && (
          <div style={{ margin: "14px 10px 10px", borderTop: "1px solid var(--surface-border)", paddingTop: "14px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              {languageNormalized === "Hindi" ? "त्वरित सुरक्षा प्रश्न:" : "Quick Starter Questions:"}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {starters.map((q, idx) => (
                <button
                  key={idx}
                  className="ss-btn-secondary"
                  style={{ 
                    width: "auto", 
                    margin: 0, 
                    padding: "8px 12px", 
                    fontSize: "12.5px", 
                    borderRadius: "20px",
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  onClick={() => handleAskCoach(q.text)}
                >
                  💬 {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box row */}
        <div className="ss-coach-input-row" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "12px", display: "flex", gap: "10px", marginTop: "8px" }}>
          <input
            className="ss-input"
            style={{ flex: 1, fontSize: "15px", padding: "12px" }}
            placeholder={
              languageNormalized === "Hindi" 
                ? "धोखाधड़ी या संदिग्ध संदेशों के बारे में पूछें..." 
                : "Describe a call/message or ask a safety question..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            aria-label="Ask the scam coach a question"
          />
          <button 
            className="ss-btn-primary ss-btn-icon" 
            style={{ width: "48px", height: "48px", minWidth: "48px", padding: 0 }}
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}
