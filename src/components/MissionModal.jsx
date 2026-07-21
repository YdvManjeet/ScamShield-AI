import React, { useState } from "react";
import { X, ArrowRight, ArrowLeft, Check, AlertCircle, Award, BookOpen } from "lucide-react";
import Card from "./Card";

const MISSION_DETAILS = {
  m1: {
    slides: [
      {
        title: "Rule #1: WhatsApp Arrest Threats are Fake",
        content: "Real police, CBI, or customs officials will never contact you over a WhatsApp video call to place you under a 'digital arrest' or demand you stay on camera.",
        icon: "📞"
      },
      {
        title: "Rule #2: Real Agencies Never Demand Online Deposits",
        content: "No government agency will ever ask you to transfer money to a 'safe RBI verification account' or ask you for your personal net banking credentials to prove your innocence.",
        icon: "💳"
      }
    ],
    question: "A caller wearing a police uniform on a WhatsApp video call claims your Aadhaar card is linked to money laundering. They demand you transfer ₹50,000 immediately to verify your identity. What should you do?",
    options: [
      { id: "a", text: "Transfer the money immediately to avoid arrest.", correct: false, feedback: "No! Real police never ask for money or 'verification deposits' to prove innocence. This is a common scam." },
      { id: "b", text: "Hang up immediately, do not transfer any money, and report it to the helpline (1930).", correct: true, feedback: "Correct! Real police will never place you under 'digital arrest' via video call. Report this attempt immediately." },
      { id: "c", text: "Ask them for their police ID badge and continue the video call.", correct: false, feedback: "Incorrect. Scammers carry convincing fake ID cards. Staying on the line allows them to manipulate you further." }
    ]
  },
  m2: {
    slides: [
      {
        title: "Rule #1: Restrict App Access",
        content: "Always enable an independent lock (biometrics, pattern, or fingerprint) specifically for your UPI applications (PhonePe, GPay, Paytm) so no one can access them if your phone is unlocked.",
        icon: "🔒"
      },
      {
        title: "Rule #2: Keep Your UPI PIN Private",
        content: "Your UPI PIN is like your bank ATM password. Never share it with anyone, type it into a google form, or write it down in your phone notes.",
        icon: "🔑"
      }
    ],
    question: "Which of the following is the safest habit for securing your digital payment apps?",
    options: [
      { id: "a", text: "Leave the UPI app open without any separate PIN or lock.", correct: false, feedback: "No, if your phone is unlocked, anyone can access your bank details." },
      { id: "b", text: "Write your UPI PIN in your contacts list under 'PIN' so you don't forget it.", correct: false, feedback: "Incorrect. Scammers often check contact lists and notes once they gain remote access." },
      { id: "c", text: "Set a dedicated biometric lock on the app, and never reveal your UPI PIN to anyone.", correct: true, feedback: "Correct! App locks and private UPI PINs are your first line of defense." }
    ]
  },
  m3: {
    slides: [
      {
        title: "Rule #1: Identify the Pressure Trap",
        content: "Scammers use fear, high-pressure demands, and official-sounding jargon to make you panic. They will forbid you from telling your family or calling friends.",
        icon: "⚠️"
      },
      {
        title: "Rule #2: Take a Breath and Disconnect",
        content: "Government agencies never enforce isolation. If someone tells you that you are legally forbidden from talking to your family, hang up immediately.",
        icon: "🛑"
      }
    ],
    question: "If someone claiming to be a TRAI or customs officer tells you that your Aadhaar has been used to send illegal packages and that you cannot tell your family, what is this?",
    options: [
      { id: "a", text: "A standard postal delivery notification.", correct: false, feedback: "No. Standard postal services never threaten you or demand isolation." },
      { id: "b", text: "A classic Digital Arrest scam designed to panic you into compliance.", correct: true, feedback: "Correct! The scammer uses isolation to prevent your family from telling you it is a scam." },
      { id: "c", text: "A genuine government security procedure.", correct: false, feedback: "Incorrect. Government officials do not threaten citizens or conduct trials over video calls." }
    ]
  },
  m4: {
    slides: [
      {
        title: "Rule #1: The Golden Hour",
        content: "If you have lost money to a cyber scam, every minute counts. Reporting the incident within the first 1-2 hours offers the highest chance of freezing the money in the scammer's bank account.",
        icon: "⏱️"
      },
      {
        title: "Rule #2: Collect Transaction Details",
        content: "Make sure you copy the exact Transaction ID, bank account number or UPI ID of the scammer, and transaction screenshot from your payment app.",
        icon: "📝"
      }
    ],
    question: "You just lost money to a digital scam. What is the single most critical phone number you should call immediately?",
    options: [
      { id: "a", text: "Wait 24 hours to see if your bank auto-refunds the transaction.", correct: false, feedback: "No! Banks do not automatically refund scam transfers. The scammer will withdraw the funds immediately if you wait." },
      { id: "b", text: "Call 1930 (National Cyber Crime Helpline) or report on cybercrime.gov.in.", correct: true, feedback: "Correct! Calling 1930 immediately routes the request to banks to freeze the scammer's accounts." },
      { id: "c", text: "Call 100 for local traffic police.", correct: false, feedback: "Incorrect. While you can report to local police, they cannot freeze digital bank transactions instantly. Use 1930." }
    ]
  },
  m5: {
    slides: [
      {
        title: "Rule #1: Receiving Money Needs NO PIN",
        content: "Receiving UPI payments needs absolutely no PIN entry or QR scanning. If you scan a QR code and enter your PIN, you are SENDING money, not receiving it.",
        icon: "📲"
      },
      {
        title: "Rule #2: Reject 'Accidental Refund' QR Codes",
        content: "Scammers often send a QR code claiming they 'accidentally' sent you extra money (e.g. ₹5,000 instead of ₹500) and demand you scan the code to return it.",
        icon: "❌"
      }
    ],
    question: "A buyer wants to send you ₹1,000 for an item. They send you a QR code to scan. What happens if you scan it and enter your UPI PIN?",
    options: [
      { id: "a", text: "You will receive the ₹1,000.", correct: false, feedback: "No! Scanning and entering a UPI PIN always debits money from your account." },
      { id: "b", text: "You will lose money (debit) because UPI PIN is only used to authorize outgoing payments.", correct: true, feedback: "Correct! Entering your PIN is only for sending money. Receiving money is completely automatic and requires no PIN." },
      { id: "c", text: "It is a standard verification step and no money will be debited.", correct: false, feedback: "Incorrect. This is a classic QR code scam that empty users' bank accounts." }
    ]
  }
};

export default function MissionModal({ mission, onClose, onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!mission) return null;
  const details = MISSION_DETAILS[mission.id];
  if (!details) return null;

  const totalSlides = details.slides.length;
  const isQuizPhase = currentSlide === totalSlides;

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const handleOptionSelect = (option) => {
    if (showFeedback && selectedOption?.correct) return;
    setSelectedOption(option);
    setShowFeedback(true);

    if (option.correct) {
      setTimeout(() => {
        setIsFinished(true);
      }, 1500);
    }
  };

  const handleClaim = () => {
    onComplete(mission.id);
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(3, 7, 18, 0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1.5px solid var(--surface-border)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "520px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--surface-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={16} color="var(--accent-strong)" />
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
              Safety Mission {mission.id.replace("m", "#")}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px 20px", flex: 1 }}>
          {isFinished ? (
            /* Success Celebration screen */
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{
                background: "rgba(245, 158, 11, 0.15)",
                borderRadius: "50%",
                padding: "16px",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--warning)",
                margin: "0 auto 16px"
              }}>
                <Award size={36} />
              </div>
              <h2 style={{ fontSize: "20px", color: "white", margin: "0 0 8px" }}>Mission Completed!</h2>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: "0 0 24px", lineHeight: 1.5 }}>
                Excellent job! You correctly identified the scam triggers and completed the safety check for <strong>{mission.title}</strong>.
              </p>

              <Card style={{
                background: "rgba(255, 255, 255, 0.02)",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-around"
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Learning XP</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--warning)", marginTop: "4px" }}>+150 XP</div>
                </div>
                <div style={{ borderLeft: "1px solid var(--surface-border)" }} />
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Scam Immunity</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--safe-strong)", marginTop: "4px" }}>+{mission.gain} pts</div>
                </div>
              </Card>

              <button
                className="ss-btn-primary"
                onClick={handleClaim}
                style={{ width: "100%", padding: "12px" }}
              >
                Claim Rewards & Finish
              </button>
            </div>
          ) : !isQuizPhase ? (
            /* Educational Slide */
            <div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "48px" }}>{details.slides[currentSlide].icon}</span>
              </div>
              <h3 style={{ fontSize: "18px", color: "white", textAlign: "center", margin: "0 0 12px" }}>
                {details.slides[currentSlide].title}
              </h3>
              <p style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                textAlign: "center",
                margin: 0
              }}>
                {details.slides[currentSlide].content}
              </p>
            </div>
          ) : (
            /* Quiz Phase */
            <div>
              <h3 style={{ fontSize: "15.5px", color: "white", lineHeight: 1.5, margin: "0 0 16px" }}>
                🛡️ Quick Check: {details.question}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {details.options.map((opt) => {
                  const isSelected = selectedOption?.id === opt.id;
                  let borderStyle = "1px solid var(--surface-border)";
                  let bgStyle = "var(--surface-2)";

                  if (showFeedback && isSelected) {
                    borderStyle = opt.correct ? "1.5px solid var(--safe-strong)" : "1.5px solid var(--danger)";
                    bgStyle = opt.correct ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt)}
                      disabled={showFeedback && selectedOption?.correct}
                      style={{
                        background: bgStyle,
                        border: borderStyle,
                        borderRadius: "10px",
                        padding: "12px 16px",
                        textAlign: "left",
                        color: isSelected ? "white" : "var(--text-muted)",
                        fontSize: "13px",
                        cursor: showFeedback && selectedOption?.correct ? "default" : "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start"
                      }}
                    >
                      <span style={{
                        marginTop: "1.5px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: "1.5px solid var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: "700",
                        flexShrink: 0
                      }}>
                        {opt.id.toUpperCase()}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: selectedOption?.correct ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  border: selectedOption?.correct ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start"
                }}>
                  {selectedOption?.correct ? (
                    <Check size={16} color="var(--safe-strong)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  ) : (
                    <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  )}
                  <span style={{ fontSize: "12px", color: selectedOption?.correct ? "var(--safe-strong)" : "var(--danger)" }}>
                    {selectedOption?.feedback}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        {!isFinished && (
          <div style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--surface-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* Progress indicators */}
            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: totalSlides + 1 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: i === currentSlide ? "var(--accent)" : "var(--surface-border)",
                    transition: "all 0.2s ease"
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {currentSlide > 0 && (
                <button
                  className="ss-btn-secondary"
                  onClick={handlePrev}
                  style={{
                    width: "auto",
                    padding: "6px 12px",
                    fontSize: "12px",
                    minHeight: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <ArrowLeft size={12} /> Back
                </button>
              )}

              {!isQuizPhase && (
                <button
                  className="ss-btn-primary"
                  onClick={handleNext}
                  style={{
                    width: "auto",
                    padding: "6px 14px",
                    fontSize: "12px",
                    minHeight: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  Next <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
