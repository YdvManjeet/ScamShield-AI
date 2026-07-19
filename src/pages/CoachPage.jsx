import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircleQuestion, HelpCircle } from "lucide-react";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import { getCoachResponse } from "../services/scamEngine";
import { ollamaService } from "../services/ollama";

export default function CoachPage({
  initialQuestion,
  onConsumedInitial,
  ollamaHost,
  ollamaModel,
  userLanguage = "English"
}) {
  const [messages, setMessages] = useState([
    {
      from: "coach",
      text: "Ask me about any scam pattern — digital arrest calls, OTP fraud, fake KYC, UPI scams, or how to report an incident.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    // Check if Ollama is available
    ollamaService.fetchModels(ollamaHost)
      .then((models) => setOllamaAvailable(models.length > 0))
      .catch(() => setOllamaAvailable(false));
  }, [ollamaHost]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuestion) {
      handleAskCoach(initialQuestion);
      onConsumedInitial?.();
    }
  }, [initialQuestion]);

  const handleAskCoach = async (query) => {
    if (!query.trim()) return;

    const userMsg = { from: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (ollamaAvailable) {
      try {
        const historyForAi = [...messages, userMsg];
        const aiReply = await ollamaService.chatWithCoach(historyForAi, query, userLanguage, ollamaHost, ollamaModel);
        setMessages((prev) => [...prev, { from: "coach", text: aiReply }]);
      } catch (err) {
        console.error("Ollama coach failed, falling back to heuristics:", err);
        const fallbackText = getCoachResponse(query);
        setMessages((prev) => [
          ...prev,
          { from: "coach", text: `${fallbackText} (Note: Offline response, Ollama service timed out.)` },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      // Deterministic fallback
      setTimeout(() => {
        const replyText = getCoachResponse(query);
        setMessages((prev) => [...prev, { from: "coach", text: replyText }]);
        setLoading(false);
      }, 500);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    handleAskCoach(input);
  };

  return (
    <div className="ss-page">
      <SectionHeading eyebrow="AI Scam Coach" title="Ask a question, get a clear answer" />
      <Card className="ss-coach-card">
        <div className="ss-coach-thread">
          {messages.map((m, i) => (
            <div key={i} className={`ss-coach-msg ss-coach-${m.from}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="ss-coach-msg ss-coach-coach" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span className="ss-spinner" style={{ width: "10px", height: "10px" }} />
              <span>Coach is typing...</span>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>
        <div className="ss-coach-input-row">
          <input
            className="ss-input"
            placeholder={ollamaAvailable ? "Ask the AI Coach anything..." : "e.g. Is a digital arrest call real?"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            aria-label="Ask the scam coach a question"
          />
          <button className="ss-btn-primary ss-btn-icon" onClick={handleSend} disabled={loading || !input.trim()} aria-label="Send">
            <Send size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}
