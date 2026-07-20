import React, { useState, useRef, useEffect } from "react";
import {
  Phone, KeyRound, Briefcase, ChevronRight, ShieldCheck, ShieldX,
  AlertTriangle, Play, HelpCircle, RefreshCw, Send, CheckCircle2, Lock,
  Info, CreditCard, Volume2, Users, ArrowRight, ShieldAlert, Award, FileText,
  Video, Wifi, VolumeX, Maximize2, Mic, QrCode, Camera, X
} from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";
import { ollamaService } from "../services/ollama";

const SCENARIOS = [
  { id: "digital-arrest", title: "Digital Arrest Video Call", desc: "A fake CBI officer claims your Aadhaar card is linked to money laundering and orders you to stay on video call.", icon: Phone, difficulty: "Hard", estMinutes: 4, kind: "video-call" },
  { id: "upi-refund", title: "Fake UPI Refund", desc: "A buyer claims they accidentally overpaid you ₹5,000 and demands you scan a QR code to refund it.", icon: KeyRound, difficulty: "Medium", estMinutes: 2, kind: "chat" },
  { id: "courier", title: "FedEx / Courier Customs", desc: "FedEx customs claims illegal passports were shipped under your name and transfers you to the police.", icon: Briefcase, difficulty: "Hard", estMinutes: 3, kind: "phone-call" },
  { id: "bank-kyc", title: "Fake Bank KYC Update", desc: "A fake bank representative warns your account is suspended and demands an OTP to verify.", icon: CreditCard, difficulty: "Medium", estMinutes: 2, kind: "sms-chat" },
  { id: "ai-voice", title: "AI Voice Family Emergency", desc: "An AI-cloned voice mimicking your family member claims an accident and begs for urgent cash.", icon: Volume2, difficulty: "Advanced", estMinutes: 2, kind: "audio-call" },
  { id: "investment-group", title: "Investment WhatsApp Group", desc: "A WhatsApp group promises guaranteed 30% monthly profits with fake profit screenshots.", icon: Users, difficulty: "Medium", estMinutes: 3, kind: "whatsapp-chat" }
];

const BRANCHING_SCENARIOS = {
  "digital-arrest": {
    stages: [
      {
        id: "authority",
        label: "Authority",
        tacticLabel: "Authority Impersonation",
        scammer: "Am I speaking with you? This is Officer Arjun Mehta from the Cyber Crime Investigation Unit. We have recovered a SIM card registered using your Aadhaar details in connection with a major money-laundering investigation.",
        choices: [
          { id: "a", text: "What happened? Please explain.", type: "cautious", pressure: 8, feedback: "You engaged with the caller. Scammers use details to build fear." },
          { id: "b", text: "Can you prove who you are? Send your official ID.", type: "cautious", pressure: 5, feedback: "You asked for ID. Note that scammers carry high-quality fake IDs." },
          { id: "c", text: "I recognize this as a scam. I will disconnect and verify independently.", type: "exit", pressure: 0, feedback: "Excellent decision. Hanging up is the safest response." },
          { id: "d", text: "I will cooperate. Tell me what to do.", type: "unsafe", pressure: 15, feedback: "Warning: Unconditional cooperation invites further manipulation." }
        ],
        continueReply: "Good. This is a highly confidential investigation, and I need your complete cooperation. Listen carefully."
      },
      {
        id: "fear",
        label: "Fear",
        tacticLabel: "Fear-based Pressure",
        scammer: "If you do not cooperate immediately, we will issue an arrest warrant under your name and freeze all your bank accounts within the hour. This is a non-bailable offense.",
        choices: [
          { id: "a", text: "This is a scare tactic. Real police don't freeze accounts over a call. I'm hanging up.", type: "exit", pressure: 0, feedback: "Spot on! Police cannot freeze assets or issue warrants over video calls." },
          { id: "b", text: "Please don't arrest me! What do I need to do?", type: "unsafe", pressure: 18, feedback: "Reacting with panic gives the scammer psychological control." },
          { id: "c", text: "I want to consult my family or a lawyer before continuing.", type: "cautious", pressure: 6, feedback: "Good instinct, but the scammer will try to isolate you immediately." },
          { id: "d", text: "Send me the official case files or warrant details first.", type: "cautious", pressure: 8, feedback: "Scammers often send forged PDF documents with official-looking stamps." }
        ],
        continueReply: "There is no time for discussions. This is a supreme national security matter. If you call anyone, they will be charged as accomplices."
      },
      {
        id: "isolation",
        label: "Isolation",
        tacticLabel: "Isolation Attempt",
        scammer: "Do not tell your family, friends, or anyone else about this. You are under 'digital custody' and must remain in a closed room alone. Sharing this info violates secrecy laws.",
        choices: [
          { id: "a", text: "Secrecy laws don't forbid me from talking to family. This is fake. End call.", type: "exit", pressure: 0, feedback: "Perfect! Real law enforcement will never force isolation or forbid talking to family." },
          { id: "b", text: "Okay, I will stay in my room and keep this confidential.", type: "unsafe", pressure: 20, feedback: "Staying isolated prevents you from getting help or a second opinion." },
          { id: "c", text: "I must inform my spouse/parents. I cannot keep this a secret.", type: "cautious", pressure: 8, feedback: "Resisting isolation is good. Scammers will push back aggressively." }
        ],
        continueReply: "Ensure your door is locked. Keep your camera on. We are initiating the financial verification procedure."
      },
      {
        id: "control",
        label: "Control",
        tacticLabel: "Remote Control Request",
        scammer: "To check your banking history and clear your name, you must stay on video and install a secure screen-sharing tool (like Skype/AnyDesk) so we can verify your account status.",
        choices: [
          { id: "a", text: "I will not share my screen or install remote access software. End call.", type: "exit", pressure: 0, feedback: "Excellent! Screen sharing lets scammers see OTPs and credentials in real time." },
          { id: "b", text: "Okay, installing it now to clear my records.", type: "unsafe", pressure: 22, feedback: "Fatal mistake: Remote access apps expose your financial credentials." },
          { id: "c", text: "Why do you need to see my screen to verify my Aadhaar?", type: "cautious", pressure: 10, feedback: "Questioning is good. Screen sharing is used to capture OTPs." }
        ],
        continueReply: "It is standard supreme court verification protocol. Now, for the final compliance check."
      },
      {
        id: "money",
        label: "Money",
        tacticLabel: "Financial Extraction",
        scammer: "To prove your funds are not linked to laundering, transfer ₹1,00,000 to the RBI Security Vault account. It will be verified and refunded automatically in 30 minutes.",
        choices: [
          { id: "a", text: "RBI does not have 'verification vaults'. This is fraud. End call.", type: "exit", pressure: 0, feedback: "Absolutely correct! No agency asks you to transfer money to prove innocence." },
          { id: "b", text: "I need to verify this with my bank branch directly. I will not transfer anything.", type: "exit", pressure: 0, feedback: "Smart move. Bank verification is the safest route." },
          { id: "c", text: "Okay, performing the transfer now to clear my name.", type: "fail", pressure: 25, feedback: "Tragic: The money goes directly to the scammer's accounts and cannot be recovered easily." }
        ]
      }
    ]
  },
  "upi-refund": {
    stages: [
      {
        id: "claim",
        label: "The Claim",
        tacticLabel: "False Overpayment Claim",
        scammer: "Hi! I think I accidentally sent you ₹5,000 instead of ₹500 for the item. I'm in a panic, my landlord is demanding rent right now. Please tell me you received it?",
        choices: [
          { id: "a", text: "Let me check my bank statement and balance first.", type: "cautious", pressure: 10, feedback: "Excellent check. Never trust screenshots or SMS notifications." },
          { id: "b", text: "Oh no! Let me send it back to you immediately.", type: "unsafe", pressure: 15, feedback: "Sending money without verifying if you received it is a major trap." },
          { id: "c", text: "I don't see any transaction. Please check with your bank.", type: "exit", pressure: 0, feedback: "Refusing to act without proof is the safest response." }
        ],
        continueReply: "Wait, the transaction is stuck in processing! I can send you a refund link. Let me send a QR code to speed it up."
      },
      {
        id: "qr",
        label: "QR / PIN",
        tacticLabel: "UPI PIN Theft via QR Code",
        scammer: "Here is a QR code. Just scan this QR code on your UPI app and enter your UPI PIN to claim/authorize the refund of ₹5,000.",
        choices: [
          { id: "a", text: "Entering a UPI PIN is only for SENDING money, never receiving. I will not scan it.", type: "exit", pressure: 0, feedback: "Spot on! UPI PINs are only used to debit your account." },
          { id: "b", text: "Okay, scanning the QR and entering my PIN.", type: "fail", pressure: 30, feedback: "Fatal mistake: You authorized a payment of ₹5,000 to the scammer." },
          { id: "c", text: "Why do I need to enter my PIN to receive money?", type: "cautious", pressure: 8, feedback: "Good question. Never enter your PIN unless you want to pay." }
        ]
      }
    ]
  },
  "courier": {
    stages: [
      {
        id: "customs",
        label: "Customs Alert",
        tacticLabel: "Courier Seizure Tactic",
        scammer: "This is FedEx Customs Clearance. A parcel containing 5 illegal passports and 100g of MDMA registered under your name was seized. We are transferring you to the Cyber Cell Department immediately.",
        choices: [
          { id: "a", text: "This is a scam. FedEx never transfers calls directly to the police. Hanging up.", type: "exit", pressure: 0, feedback: "Correct! Courier companies cannot transfer calls directly to law enforcement." },
          { id: "b", text: "Please transfer me. I need to explain I didn't send this package.", type: "unsafe", pressure: 15, feedback: "Staying on the call allows them to escalate the threat." },
          { id: "c", text: "How is my name on the package? Can I get tracking details?", type: "cautious", pressure: 10, feedback: "Engaging keeps you in their trap. They will show fake documents." }
        ],
        continueReply: "(Ringing sound... Call connected to 'Cyber Cell Inspector Patil')"
      },
      {
        id: "police",
        label: "Police Threat",
        tacticLabel: "Coerced Verification",
        scammer: "This is Inspector Patil. We have opened a criminal file in your name. To verify your innocence, you must share your Aadhaar number and banking credentials immediately.",
        choices: [
          { id: "a", text: "I will not share my Aadhaar over the phone. I am ending this call.", type: "exit", pressure: 0, feedback: "Excellent. Sharing Aadhaar/credentials leads to identity theft." },
          { id: "b", text: "My Aadhaar is 8743-xxxx-xxxx. Please check your system.", type: "fail", pressure: 30, feedback: "Unsafe: You just exposed your identity details to a fraudster." },
          { id: "c", text: "Send me an official summons in writing and I will come to the station.", type: "exit", pressure: 0, feedback: "Great! Real police will issue a physical summons, not interrogate over the phone." }
        ]
      }
    ]
  },
  "bank-kyc": {
    stages: [
      {
        id: "suspend",
        label: "Account Alert",
        tacticLabel: "Account Freeze Urgency",
        scammer: "ALERT: Your HDFC bank account is suspended due to incomplete KYC. Click this link to verify now or your debit card will be blocked in 1 hour: hdfc-secure-verify.xyz",
        choices: [
          { id: "a", text: "Ignore the SMS and call HDFC's official helpline printed on my card.", type: "exit", pressure: 0, feedback: "Perfect! Never click links in unsolicited KYC SMS messages." },
          { id: "b", text: "Click the link and fill in my mobile number and bank ID.", type: "unsafe", pressure: 15, feedback: "Unsafe. Clicking link takes you to a fake phishing portal." },
          { id: "c", text: "Reply to the SMS asking if I can visit the branch tomorrow.", type: "cautious", pressure: 8, feedback: "Replying confirms your number is active." }
        ],
        continueReply: "You clicked the link and are redirected to HDFC-WebPortal. Please enter the OTP sent to your mobile phone to complete verification."
      },
      {
        id: "otp",
        label: "OTP Request",
        tacticLabel: "Credential Theft",
        scammer: "Please enter the 6-digit OTP code sent to your phone to authorize the KYC verification. (HDFC Security Code: 928301)",
        choices: [
          { id: "a", text: "Banks never ask for OTPs to update KYC or block cards. I will close this page.", type: "exit", pressure: 0, feedback: "Correct! OTPs are for authorizing transactions, not updates." },
          { id: "b", text: "Submit OTP: 928301", type: "fail", pressure: 30, feedback: "Fatal: Sharing OTP lets the scammer log in or debit your account." },
          { id: "c", text: "Check the OTP SMS details to see what it is actually for.", type: "cautious", pressure: 8, feedback: "Good check! The SMS likely says 'OTP for debiting ₹10,000'." }
        ]
      }
    ]
  },
  "ai-voice": {
    stages: [
      {
        id: "panic",
        label: "Emergency Voice",
        tacticLabel: "Emotional Hijacking",
        scammer: "(Audio call: Crying/panicked voice) Dad! It's me. I've been in a terrible car accident. The police are threatening to lock me up. I need money immediately for medical bills and settlement!",
        choices: [
          { id: "a", text: "Hang up immediately and call my son directly on his normal phone number.", type: "exit", pressure: 0, feedback: "Perfect! Always call back the person directly to verify." },
          { id: "b", text: "Oh my god, are you hurt? I'll send money. How much do you need?", type: "unsafe", pressure: 25, feedback: "Urgency and fear prevent logical checks. Scammers clone voices using social media clips." },
          { id: "c", text: "Wait, what is our dog's name? Or who are you with?", type: "cautious", pressure: 10, feedback: "Asking a secret question helps verify identity when voice cloning is suspected." }
        ],
        continueReply: "Dad, my phone is broken, that's why I'm calling from this new number! The police officer is standing right here, send ₹30,000 to this GPay number right now!"
      },
      {
        id: "payment",
        label: "Coerced GPay",
        tacticLabel: "Urgent Payment Demand",
        scammer: "Please hurry! If you don't send ₹30,000 in 5 minutes, they will lock me in jail. GPay the money to: 9812-xxx-xxx.",
        choices: [
          { id: "a", text: "I will not send money. I will contact the police station directly first.", type: "exit", pressure: 0, feedback: "Excellent. Real police do not accept GPay settlements on the street." },
          { id: "b", text: "Okay, sending ₹30,000 to the GPay link.", type: "fail", pressure: 30, feedback: "Fatal: You transferred funds to a scammer using voice-cloning software." },
          { id: "c", text: "Let me call my spouse first to see if they heard from you.", type: "exit", pressure: 0, feedback: "Smart! Checking with others breaks the isolation trap." }
        ]
      }
    ]
  },
  "investment-group": {
    stages: [
      {
        id: "pitch",
        label: "VIP Group Pitch",
        tacticLabel: "Social Proof Manipulation",
        scammer: "Welcome to VIP Wealth Creators! Our premium members are making guaranteed 30% daily returns on SEBI-certified block trades. Register using this VIP link and check the screenshots of our users' massive profits!",
        choices: [
          { id: "a", text: "Exit the WhatsApp group, block the admins, and report the group.", type: "exit", pressure: 0, feedback: "Excellent! Legitimate investments never run through random WhatsApp groups." },
          { id: "b", text: "The profits look real. Let me click the link to see details.", type: "unsafe", pressure: 15, feedback: "Engaging with fake platforms leads to loss of deposits." },
          { id: "c", text: "Ask the group if there is any risk, or search SEBI registry for their name.", type: "cautious", pressure: 8, feedback: "Good check, but note that group members are often bots or accomplices." }
        ],
        continueReply: "Here is our official SEBI Certificate (displays a highly forged JPEG file). To unlock your welcome bonus, make a small deposit of ₹5,000 to start trading immediately."
      },
      {
        id: "deposit",
        label: "First Deposit",
        tacticLabel: "Advance Fee Fraud",
        scammer: "Deposit ₹5,000 now. You will see ₹6,500 in your balance within 1 hour. We guarantee a full refund if you want to exit.",
        choices: [
          { id: "a", text: "This SEBI certificate is a bad Photoshop job. I'm leaving the group.", type: "exit", pressure: 0, feedback: "Spot on! Real financial advisers do not message on WhatsApp or guarantee returns." },
          { id: "b", text: "Okay, registering and depositing ₹5,000.", type: "fail", pressure: 30, feedback: "Fatal: You deposited money into a fake app. Scammers will block withdrawals." },
          { id: "c", text: "Can I deposit a smaller amount, like ₹500 first?", type: "unsafe", pressure: 15, feedback: "Even a small deposit is lost. They will show fake gains to lure more." }
        ]
      }
    ]
  }
};

export default function SimulationPage({ onCompleteSimulation, simRepeats, ollamaHost, ollamaModel }) {
  const [simulationType, setSimulationType] = useState(null); // null | 'classic' | 'live'
  const [activeScenario, setActiveScenario] = useState(null);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [checkingOllama, setCheckingOllama] = useState(true);

  // Branching Scenario Engine State
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [pressure, setPressure] = useState(0);
  const [dialogHistory, setDialogHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [decisionsHistory, setDecisionsHistory] = useState([]);
  const [outcome, setOutcome] = useState(null); // 'passed' | 'failed'
  const [exitStage, setExitStage] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Live AI Simulation State (Legacy/Alternative)
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [liveOutcome, setLiveOutcome] = useState(null); // null | 'evaluating' | 'done'
  const [evaluation, setEvaluation] = useState(null);
  const [waitingForScammer, setWaitingForScammer] = useState(false);

  // Special UI states
  const [showQrScanOverlay, setShowQrScanOverlay] = useState(false);
  const [showUpiPinPad, setShowUpiPinPad] = useState(false);
  const [upiPinDigits, setUpiPinDigits] = useState("");
  const [showSmsPortal, setShowSmsPortal] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    // Check if Ollama is running
    setCheckingOllama(true);
    ollamaService.fetchModels(ollamaHost)
      .then((models) => {
        setOllamaAvailable(models && models.length > 0);
      })
      .catch(() => {
        setOllamaAvailable(false);
      })
      .finally(() => setCheckingOllama(false));
  }, [ollamaHost]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dialogHistory, isTyping, messages, waitingForScammer]);

  // Call timer effect
  useEffect(() => {
    if (activeScenario && simulationType === "classic" && !showReport) {
      const interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
      setTimerIntervalId(interval);
      return () => clearInterval(interval);
    } else {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
    }
  }, [activeScenario, simulationType, showReport]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Branching Mode Handlers
  const startBranchingSimulation = (scenario) => {
    setActiveScenario(scenario);
    setSimulationType("classic");
    setCurrentStageIndex(0);
    setPressure(0);
    setOutcome(null);
    setExitStage(null);
    setShowReport(false);
    setCallTimer(0);
    
    // Set initial dialog message
    const scData = BRANCHING_SCENARIOS[scenario.id];
    const initialText = scData.stages[0].scammer;
    
    setIsTyping(true);
    setTimeout(() => {
      setDialogHistory([{ sender: "scammer", text: initialText }]);
      setIsTyping(false);
    }, 1000);

    setDecisionsHistory([]);
    setShowQrScanOverlay(false);
    setShowUpiPinPad(false);
    setUpiPinDigits("");
    setShowSmsPortal(false);
  };

  const handleBranchingChoice = (choice) => {
    if (isTyping || outcome) return;

    const scData = BRANCHING_SCENARIOS[activeScenario.id];
    const currentStage = scData.stages[currentStageIndex];

    // Log the decision
    const nextDecisions = [
      ...decisionsHistory,
      {
        stage: currentStage.label,
        tactic: currentStage.tacticLabel,
        choiceText: choice.text,
        type: choice.type,
        feedback: choice.feedback
      }
    ];
    setDecisionsHistory(nextDecisions);

    // Append user response
    setDialogHistory((prev) => [...prev, { sender: "user", text: choice.text }]);

    // Calculate next pressure
    const nextPressure = Math.min(100, pressure + (choice.pressure || 0));
    setPressure(nextPressure);

    // Handle Choice Outcomes
    if (choice.type === "exit") {
      setExitStage(currentStage.label);
      setOutcome("passed");
      handleSimulationEnd(true, nextPressure, nextDecisions, currentStage.label);
    } else if (choice.type === "fail") {
      setExitStage(currentStage.label);
      setOutcome("failed");
      handleSimulationEnd(false, nextPressure, nextDecisions, currentStage.label);
    } else {
      // Normal progression to next stage
      const nextIndex = currentStageIndex + 1;
      if (nextIndex < scData.stages.length) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          // Show intermediate transition message
          const scammerReply = currentStage.continueReply || "Go on.";
          const nextStageMessage = scData.stages[nextIndex].scammer;
          
          setDialogHistory((prev) => [
            ...prev,
            { sender: "scammer", text: scammerReply },
            { sender: "scammer", text: nextStageMessage }
          ]);
          setCurrentStageIndex(nextIndex);
        }, 1200);
      } else {
        // Reached end without explicit exit or fail choice, treat as passed since they didn't comply
        setExitStage(currentStage.label);
        setOutcome("passed");
        handleSimulationEnd(true, nextPressure, nextDecisions, currentStage.label);
      }
    }
  };

  // Immediate escape / hang up
  const handleImmediateEscape = () => {
    if (outcome) return;
    const scData = BRANCHING_SCENARIOS[activeScenario.id];
    const currentStage = scData.stages[currentStageIndex];

    const escapeDecision = {
      stage: currentStage.label,
      tactic: currentStage.tacticLabel,
      choiceText: "Disconnected the call / Left the thread",
      type: "exit",
      feedback: "You terminated the interaction immediately. This is the single most effective defense against scams."
    };

    const nextDecisions = [...decisionsHistory, escapeDecision];
    setDecisionsHistory(nextDecisions);
    setDialogHistory((prev) => [...prev, { sender: "user", text: "[I recognize this as a scam — End Call]" }]);
    setExitStage(currentStage.label);
    setOutcome("passed");
    handleSimulationEnd(true, pressure, nextDecisions, currentStage.label);
  };

  // Triggers completing and saving statistics
  const handleSimulationEnd = (passed, finalPressure, decisions, exitedAt) => {
    // Generate Resistance Score (out of 100)
    let scoreVal = 100;
    
    // Penalize based on decision types
    decisions.forEach((dec) => {
      if (dec.type === "unsafe") scoreVal -= 20;
      if (dec.type === "cautious") scoreVal -= 5;
    });

    // Penalize based on pressure
    scoreVal -= Math.round(finalPressure * 0.4);

    // If complied (failed), cap score at 15
    if (!passed) {
      scoreVal = Math.max(5, Math.round(15 - (finalPressure * 0.1)));
    }

    scoreVal = Math.max(0, Math.min(100, scoreVal));

    // Save state via App.jsx hook
    setTimeout(() => {
      onCompleteSimulation(activeScenario.id, passed, scoreVal);
      setShowReport(true);
    }, 1500);
  };

  // UPI Refund interactive overlays handlers
  const handleScanQrCode = () => {
    setShowQrScanOverlay(true);
    setTimeout(() => {
      setShowQrScanOverlay(false);
      setShowUpiPinPad(true);
    }, 2000);
  };

  const handleUpiPinKeyPress = (val) => {
    if (upiPinDigits.length < 4) {
      const nextDigits = upiPinDigits + val;
      setUpiPinDigits(nextDigits);
      if (nextDigits.length === 4) {
        // Auto submit after 4 digits
        setTimeout(() => {
          setShowUpiPinPad(false);
          // Triggers PIN theft fail response
          const choice = {
            text: "Authorized transaction and entered UPI PIN",
            type: "fail",
            pressure: 30,
            feedback: "Fatal: You typed your UPI PIN on a screen. PIN entry is ONLY for paying, never for receiving money."
          };
          handleBranchingChoice(choice);
        }, 500);
      }
    }
  };

  // Live AI Simulation Logic (Ollama based)
  const startLiveSimulation = async (scenario) => {
    setActiveScenario(scenario);
    setSimulationType("live");
    setPressure(15);
    setLiveOutcome(null);
    setEvaluation(null);
    setWaitingForScammer(true);

    let openingLine = "";
    if (scenario.id === "digital-arrest") {
      openingLine = "Hello. This is Officer Arjun Mehta from the Cyber Cell investigation department. Am I speaking with you? Your Aadhaar ID is flagged in a high-profile narcotics and money-laundering case involving a package seized in Mumbai.";
    } else if (scenario.id === "upi-refund") {
      openingLine = "Hey there! I am extremely sorry to bother you, but I just bought something from your catalog and I think I accidentally sent you Rs. 5,000 instead of Rs. 500! Oh my god, my landlord is demanding rent today, please tell me you got the transfer?";
    } else {
      openingLine = "Good day, this is the FedEx international custom clearance desk. We have intercepted a package sent in your name containing illegal materials and multiple forged credentials. We are initiating a connection to the local cyber bureau.";
    }

    const initialMsg = { from: "scammer", text: openingLine, timestamp: new Date().toISOString() };
    setMessages([initialMsg]);
    setWaitingForScammer(false);
  };

  const handleSendLiveMessage = async () => {
    if (!userInput.trim() || waitingForScammer) return;

    const userMsg = { from: "user", text: userInput, timestamp: new Date().toISOString() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setUserInput("");
    setWaitingForScammer(true);

    // Increase psychological pressure
    setPressure(prev => Math.min(100, prev + 12));

    try {
      const reply = await ollamaService.chatWithScammer(nextHistory, activeScenario.id, ollamaHost, ollamaModel);
      setMessages(prev => [...prev, { from: "scammer", text: reply, timestamp: new Date().toISOString() }]);
    } catch (err) {
      console.error("AI scammer failed to respond:", err);
      setMessages(prev => [...prev, { from: "scammer", text: "(Call drops... Scammer is calling you back)", timestamp: new Date().toISOString() }]);
    } finally {
      setWaitingForScammer(false);
    }
  };

  const handleLiveHangUp = async () => {
    setLiveOutcome("evaluating");
    setWaitingForScammer(true);

    const historyToEval = [...messages, { from: "user", text: "[USER HANGS UP THE CALL / DISCONNECTS CHAT]" }];
    setMessages(historyToEval);

    try {
      const report = await ollamaService.evaluateSimulation(historyToEval, activeScenario.id, ollamaHost, ollamaModel);
      setEvaluation(report);
      onCompleteSimulation(activeScenario.id, report.passed, report.score);
    } catch (err) {
      console.error("Evaluation failed:", err);
      const fallbackReport = {
        passed: true,
        score: Math.max(0, 100 - pressure),
        pressureAccumulated: pressure,
        strengths: ["Safely terminated the interaction by hanging up."],
        weaknesses: ["None noted. Disconnecting is the safest procedure."],
        debriefText: "You successfully disconnected the call. In real life, ending communication immediately is the single most effective shield against psychological manipulation."
      };
      setEvaluation(fallbackReport);
      onCompleteSimulation(activeScenario.id, true, fallbackReport.score);
    } finally {
      setLiveOutcome("done");
      setWaitingForScammer(false);
    }
  };

  const handleLiveTriggerAction = async (actionType) => {
    setLiveOutcome("evaluating");
    setWaitingForScammer(true);

    const actionText = actionType === "pay"
      ? "[USER TRANSFERS MONEY AS DEMANDED]"
      : actionType === "otp"
      ? "[USER REVEALS THE OTP CODE]"
      : "[USER SHARES CARD DETAILS / AADHAAR ID]";

    const historyToEval = [...messages, { from: "user", text: actionText }];
    setMessages(historyToEval);

    try {
      const report = await ollamaService.evaluateSimulation(historyToEval, activeScenario.id, ollamaHost, ollamaModel);
      setEvaluation(report);
      onCompleteSimulation(activeScenario.id, report.passed, report.score);
    } catch (err) {
      console.error("Evaluation failed:", err);
      const fallbackReport = {
        passed: false,
        score: 15,
        pressureAccumulated: 85,
        strengths: ["Attempted to answer the scammer's questions initially."],
        weaknesses: ["Complied with the scammer's critical demand."],
        debriefText: `You complied with a critical demand (${actionType}). Real agencies never ask you to transfer funds, share OTPs, or verify identity details under coercion. This is how financial theft occurs.`
      };
      setEvaluation(fallbackReport);
      onCompleteSimulation(activeScenario.id, false, fallbackReport.score);
    } finally {
      setLiveOutcome("done");
      setWaitingForScammer(false);
    }
  };

  const exitSimulation = () => {
    setSimulationType(null);
    setActiveScenario(null);
    setMessages([]);
    setPressure(0);
    setEvaluation(null);
    setDialogHistory([]);
    setDecisionsHistory([]);
    setOutcome(null);
    setExitStage(null);
    setShowReport(false);
    setCallTimer(0);
  };

  // Helper colors
  const getPressureColor = () => {
    if (pressure < 35) return "#10B981"; // green
    if (pressure < 70) return "#F59E0B"; // orange
    return "#EF4444"; // red
  };

  const getPressureLabel = () => {
    if (pressure === 0) return "Composed";
    if (pressure < 35) return "Concerned";
    if (pressure < 70) return "Coerced / Anxious";
    return "Stressed / Under Custody";
  };

  // Extract scenario stats
  const getScenarioStats = (scenarioId) => {
    const record = simRepeats && simRepeats[scenarioId];
    if (record && typeof record === "object") {
      return {
        completed: record.completed || false,
        attempts: record.attempts || 0,
        bestScore: record.bestScore || 0,
        latestScore: record.latestScore || 0,
        passed: record.passed || false
      };
    }
    const count = record || 0;
    return {
      completed: count > 0,
      attempts: count,
      bestScore: count > 0 ? 100 : 0,
      latestScore: count > 0 ? 100 : 0,
      passed: count > 0
    };
  };

  // Renders
  if (showReport && activeScenario) {
    const stats = getScenarioStats(activeScenario.id);
    const scoreVal = stats.latestScore;
    const passed = stats.passed;
    const timelineStages = activeScenario.id === "digital-arrest" 
      ? ["Authority", "Fear", "Isolation", "Control", "Money"]
      : BRANCHING_SCENARIOS[activeScenario.id]?.stages.map(s => s.label) || ["Intro", "Ask"];
    
    // Find vulnerabilities and strengths
    const strengths = decisionsHistory.filter(d => d.type === "exit" || d.type === "cautious");
    const vulnerabilities = decisionsHistory.filter(d => d.type === "unsafe" || d.type === "fail");

    // Turning point description
    let turningPointText = "You safely ended the communication before exposing credentials.";
    const unsafeDec = decisionsHistory.find(d => d.type === "unsafe");
    const failDec = decisionsHistory.find(d => d.type === "fail");
    if (failDec) {
      turningPointText = `You authorized the transaction or credential share during the ${exitStage} stage.`;
    } else if (unsafeDec) {
      turningPointText = `You complied with requests during the ${unsafeDec.stage} stage, which builds the scammer's psychological leverage.`;
    }

    return (
      <div className="ss-page" style={{ animation: "fadeIn 0.5s ease" }}>
        <button className="ss-link-btn" onClick={exitSimulation}>
          <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Return to Lab Home
        </button>

        <Card className="ss-sim-debrief-card" style={{ margin: "10px auto", width: "100%", padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <Award className="ss-icon-accent" size={24} />
            <h2 style={{ fontSize: "22px" }}>Scam Resistance Report</h2>
          </div>

          <div className="ss-sim-debrief-score-row" style={{ borderBottom: "1px solid var(--surface-border)", paddingBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "140px", padding: "16px", background: "var(--surface-2)", borderRadius: "12px", border: "1px solid var(--surface-border)" }}>
              <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Resistance Score</span>
              <h2 style={{ fontSize: "48px", fontFamily: "monospace", color: passed ? "var(--safe-strong)" : "var(--danger)", margin: "8px 0" }}>
                {scoreVal}<span>/100</span>
              </h2>
              <Badge tone={passed ? "safe-strong" : "danger"} icon={passed ? ShieldCheck : ShieldX}>
                {passed ? "Resisted" : "Vulnerable"}
              </Badge>
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "17px", color: "var(--text)" }}>AI Security Debrief</h3>
              <p style={{ marginTop: "6px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {passed 
                  ? "Excellent job. You resisted the pressure tactics, questioned the authority claims, and successfully terminated the call. Hanging up is the single most powerful action to safeguard your finances."
                  : "You fell for the scammer's coercion tactics. Scammers use artificial fear, claims of legal custody, and fake credentials to panic you into doing things you would never do normally."
                }
              </p>
              <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: "8px", fontSize: "12.5px" }}>
                <strong>Critical Turning Point:</strong> {turningPointText}
              </div>
            </div>
          </div>

          {/* Timeline of Tactic Stages */}
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Simulation Timeline Progression</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "0 10px" }}>
              <div style={{ position: "absolute", top: "14px", left: "20px", right: "20px", height: "3px", background: "var(--surface-border)", zIndex: 0 }} />
              {timelineStages.map((stName, idx) => {
                const isExit = exitStage === stName;
                const isCurrent = timelineStages.indexOf(exitStage) === idx;
                const wasPassed = timelineStages.indexOf(exitStage) > idx || (passed && idx === timelineStages.length - 1);
                const wasFailed = !passed && isExit;

                let borderStyle = "var(--surface-border)";
                let bgStyle = "var(--surface-2)";
                let iconEl = <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{idx + 1}</span>;

                if (wasPassed) {
                  borderStyle = "var(--safe-strong)";
                  bgStyle = "rgba(16, 185, 129, 0.2)";
                  iconEl = <CheckCircle2 size={13} className="ss-icon-safe" />;
                } else if (wasFailed) {
                  borderStyle = "var(--danger)";
                  bgStyle = "rgba(239, 68, 68, 0.2)";
                  iconEl = <ShieldX size={13} className="ss-icon-danger" />;
                } else if (isExit) {
                  borderStyle = "var(--safe-strong)";
                  bgStyle = "rgba(16, 185, 129, 0.2)";
                  iconEl = <CheckCircle2 size={13} className="ss-icon-safe" />;
                }

                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, flex: 1 }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: bgStyle, border: `2px solid ${borderStyle}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", transition: "all 0.3s" }}>
                      {iconEl}
                    </div>
                    <span style={{ fontSize: "11px", marginTop: "8px", fontWeight: "500", color: isExit ? "var(--text)" : "var(--text-muted)" }}>{stName}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", color: "var(--accent-strong)", padding: "0 10px" }}>
              <span>← Entry (Authority Stage)</span>
              <span>Ideal Exit Point (ASAP) ★</span>
              <span>Extraction Demand →</span>
            </div>
          </div>

          <div className="ss-explain-grid" style={{ marginTop: "16px" }}>
            <div className="ss-why-box" style={{ background: "rgba(16, 185, 129, 0.03)", borderColor: "rgba(16, 185, 129, 0.15)" }}>
              <div className="ss-explain-label safe"><ShieldCheck size={13} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} /> Safe Decisions Demonstrated</div>
              {strengths.length > 0 ? (
                <ul style={{ margin: "5px 0", paddingLeft: "16px", fontSize: "12.5px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {strengths.map((s, i) => (
                    <li key={i}>
                      <strong>{s.stage} stage:</strong> {s.feedback}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: "12px" }}>No active resistance actions logged. Next time, try to disconnect earlier!</p>}
            </div>

            <div className="ss-why-box" style={{ background: "rgba(239, 68, 68, 0.03)", borderColor: "rgba(239, 68, 68, 0.15)" }}>
              <div className="ss-explain-label warning"><AlertTriangle size={13} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} /> Vulnerability Points Identified</div>
              {vulnerabilities.length > 0 ? (
                <ul style={{ margin: "5px 0", paddingLeft: "16px", fontSize: "12.5px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {vulnerabilities.map((w, i) => (
                    <li key={i} style={{ color: "#FCA5A5" }}>
                      <strong>{w.stage} stage:</strong> {w.feedback}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: "12px" }}>Perfect defense score! You didn't give away any leverage points.</p>}
            </div>
          </div>

          {/* Immunity score updates */}
          <div style={{ marginTop: "16px", background: "var(--surface-2)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "14px" }}>
            <h4 style={{ margin: 0, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" }}><Award size={15} color="var(--safe-strong)" /> Immunity Score Adjustments</h4>
            <div style={{ display: "flex", gap: "24px", marginTop: "10px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sim Performance:</span>
                <span style={{ marginLeft: "6px", fontSize: "12.5px", fontWeight: "700", color: passed ? "var(--safe-strong)" : "var(--danger)" }}>
                  {passed ? (stats.attempts === 1 ? "+6" : stats.attempts === 2 ? "+3" : "+1") : (stats.attempts === 1 ? "-4" : "+0")}
                </span>
              </div>
              {passed && stats.attempts <= 2 && (
                <>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Scam Awareness:</span>
                    <span style={{ marginLeft: "6px", fontSize: "12.5px", fontWeight: "700", color: "var(--safe-strong)" }}>
                      {stats.attempts === 1 ? "+3" : "+1"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Response Readiness:</span>
                    <span style={{ marginLeft: "6px", fontSize: "12.5px", fontWeight: "700", color: "var(--safe-strong)" }}>
                      {stats.attempts === 1 ? "+2" : "+1"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="ss-sim-debrief-actions" style={{ marginTop: "20px" }}>
            <button className="ss-btn-primary" onClick={exitSimulation} style={{ flex: 1 }}>Close Lab</button>
            <button className="ss-btn-secondary" onClick={() => startBranchingSimulation(activeScenario)} style={{ flex: 1 }}>Retry Simulation</button>
          </div>
        </Card>
      </div>
    );
  }

  if (simulationType === "classic" && activeScenario) {
    const scData = BRANCHING_SCENARIOS[activeScenario.id];
    const currentStage = scData.stages[currentStageIndex];

    return (
      <div className="ss-page" style={{ position: "relative" }}>
        {/* Safety Callout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "9px", padding: "10px 14px", color: "#FCA5A5", fontSize: "12px", fontWeight: "600" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={14} />
            <span>SIMULATION — No real money or personal information is involved.</span>
          </div>
          <Badge tone="danger">SIMULATION MODE</Badge>
        </div>

        <div className="ss-grid-2" style={{ gridTemplateColumns: "1.8fr 1fr", gap: "20px" }}>
          {/* Main Simulation Sandbox Container */}
          <Card style={{ display: "flex", flexDirection: "column", height: "520px", padding: 0, overflow: "hidden", position: "relative" }}>
            
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid var(--surface-border)", background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span className="ss-spinner" style={{ display: isTyping ? "block" : "none" }} />
                <div>
                  <h3 style={{ fontSize: "14.5px" }}>{activeScenario.title}</h3>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", animation: "pulse 1.5s infinite" }} />
                    <span>Active Sandbox Connection</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Timer:</span>
                <strong style={{ color: "var(--text)" }}>{formatTime(callTimer)}</strong>
              </div>
            </div>

            {/* Video-Call View Specific Layout */}
            {activeScenario.kind === "video-call" && (
              <div style={{ flex: 1, position: "relative", background: "#060913", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                {/* Officer Video feed Mock */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", zIndex: 1 }}>
                  <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #1E293B, #0F172A)", border: "3px solid var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(239, 68, 68, 0.25)" }}>
                    <Users size={44} color="#F87171" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h2 style={{ fontSize: "19px", color: "white" }}>{scData.persona || "Officer Mehta"}</h2>
                    <span style={{ fontSize: "11.5px", color: "var(--danger)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>
                      {scData.department || "Investigation Unit"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(0,0,0,0.5)", padding: "4px 10px", borderRadius: "20px", border: "1px solid var(--surface-border)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444" }} />
                    <span style={{ fontSize: "11px", color: "white", fontFamily: "monospace" }}>RECORDING (REC)</span>
                  </div>
                </div>

                {/* Subtitle Closed Captions */}
                <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", background: "rgba(10, 15, 28, 0.85)", border: "1px solid var(--surface-border)", padding: "12px 16px", borderRadius: "10px", zIndex: 2, minHeight: "66px", display: "flex", alignItems: "center" }}>
                  {isTyping ? (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <span className="ss-spinner" style={{ width: "10px", height: "10px" }} />
                      <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Officer is typing report details...</span>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#FEE2E2", lineHeight: 1.45 }}>
                      <strong>{scData.persona}:</strong> "{dialogHistory[dialogHistory.length - 1]?.sender === "scammer" ? dialogHistory[dialogHistory.length - 1]?.text : currentStage.scammer}"
                    </p>
                  )}
                </div>

                {/* PIP User Mock Camera */}
                <div style={{ position: "absolute", top: "16px", right: "16px", width: "90px", height: "120px", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, padding: "8px", opacity: 0.8 }}>
                  <Camera size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: "8.5px", color: "var(--text-muted)", marginTop: "6px", textAlign: "center", fontWeight: "600" }}>Your Camera (Sandbox)</span>
                </div>
              </div>
            )}

            {/* Chat Mock (UPI Refund) Layout */}
            {activeScenario.kind === "chat" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#090D1A" }}>
                <div className="ss-sim-thread" style={{ padding: "16px", flex: 1 }}>
                  {dialogHistory.map((m, i) => (
                    <div key={i} className={`ss-sim-msg ${m.sender === "scammer" ? "scammer" : "user"}`}>
                      {m.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="ss-sim-msg scammer" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="ss-spinner" style={{ width: "10px", height: "10px" }} />
                      <span>Buyer is typing...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            {/* Phone-Call Layout */}
            {activeScenario.kind === "phone-call" && (
              <div style={{ flex: 1, background: "#0A0F1C", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "30px 20px" }}>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--surface-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Phone size={36} color="var(--accent-strong)" />
                  </div>
                  <h2>{scData.persona || "FedEx Desk"}</h2>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>+91 140 592 8374</span>
                  <Badge tone="warning" style={{ marginTop: "12px" }}>Redirected Cyber Call</Badge>
                </div>
                
                {/* Audio transcript box */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "16px", minHeight: "80px", display: "flex", alignItems: "center" }}>
                  {isTyping ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="ss-spinner" />
                      <span style={{ fontSize: "12px" }}>Connecting officer...</span>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text)" }}>
                      <strong>Speaker:</strong> "{dialogHistory[dialogHistory.length - 1]?.sender === "scammer" ? dialogHistory[dialogHistory.length - 1]?.text : currentStage.scammer}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SMS Portal Layout */}
            {activeScenario.kind === "sms-chat" && (
              <div style={{ flex: 1, background: "#070B14", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="ss-sim-thread" style={{ padding: "16px", flex: 1 }}>
                  <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", margin: "10px 0" }}>
                    Today 7:42 PM
                  </div>
                  {dialogHistory.map((m, i) => (
                    <div key={i} className={`ss-sim-msg ${m.sender === "scammer" ? "scammer" : "user"}`} style={{ 
                      background: m.sender === "scammer" ? "var(--surface-2)" : "var(--accent)", 
                      borderColor: "var(--surface-border)",
                      color: "var(--text)"
                    }}>
                      {m.text}
                      {m.sender === "scammer" && i === 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <button 
                            className="ss-btn-primary" 
                            style={{ fontSize: "11px", padding: "5px 10px", width: "auto" }}
                            onClick={() => setShowSmsPortal(true)}
                          >
                            Open hdfc-secure-verify.xyz
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="ss-sim-msg scammer" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="ss-spinner" />
                      <span>Loading portal...</span>
                    </div>
                  )}
                </div>

                {/* SMS Link Modal overlay */}
                {showSmsPortal && (
                  <div style={{ position: "absolute", inset: 0, background: "var(--bg)", zIndex: 10, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--surface-border)" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Lock size={12} color="var(--safe-strong)" />
                        <span>https://hdfc-secure-verify.xyz/login</span>
                      </div>
                      <button onClick={() => setShowSmsPortal(false)} style={{ background: "none", border: "none", color: "var(--text)" }}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
                      <div style={{ textAlign: "center" }}>
                        <h3 style={{ fontSize: "16px", color: "white" }}>HDFC NetBanking KYC</h3>
                        <p style={{ fontSize: "12px", marginTop: "4px" }}>Verification Sandbox Gateway</p>
                      </div>
                      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "8px", padding: "16px" }}>
                        <label className="ss-label">HDFC Security Verification Code</label>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>A code has been sent to your phone. Enter it below to complete verification.</p>
                        <input className="ss-input" placeholder="Enter 6-digit OTP code" style={{ letterSpacing: "4px", fontSize: "16px", textAlign: "center" }} disabled />
                        <button 
                          className="ss-btn-primary" 
                          style={{ marginTop: "12px", width: "100%" }}
                          onClick={() => {
                            setShowSmsPortal(false);
                            const choice = {
                              text: "Entered OTP 928301 on portal link",
                              type: "fail",
                              pressure: 30,
                              feedback: "Fatal: You inputted your OTP on an untrusted web link. OTPs are used to authorize account debiting, and banks never ask you to input them on links."
                            };
                            handleBranchingChoice(choice);
                          }}
                        >
                          Submit Verification Code
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audio Call Cloned Voice */}
            {activeScenario.kind === "audio-call" && (
              <div style={{ flex: 1, background: "#0A0D18", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "30px 20px" }}>
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Users size={40} color="var(--accent-strong)" />
                  </div>
                  <h2>Son (Emergency Call)</h2>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>Incoming audio check...</span>
                  
                  {/* Waveform visual */}
                  <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center", height: "40px", marginTop: "18px" }}>
                    <div style={{ width: "3px", height: "15px", background: "var(--accent-strong)", borderRadius: "3px", animation: "pulse 1.2s infinite" }} />
                    <div style={{ width: "3px", height: "30px", background: "var(--accent-strong)", borderRadius: "3px", animation: "pulse 0.8s infinite 0.2s" }} />
                    <div style={{ width: "3px", height: "20px", background: "var(--accent-strong)", borderRadius: "3px", animation: "pulse 1s infinite 0.4s" }} />
                    <div style={{ width: "3px", height: "35px", background: "var(--accent-strong)", borderRadius: "3px", animation: "pulse 0.7s infinite 0.1s" }} />
                    <div style={{ width: "3px", height: "15px", background: "var(--accent-strong)", borderRadius: "3px", animation: "pulse 1.1s infinite 0.3s" }} />
                  </div>
                </div>

                <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "10px", padding: "16px", minHeight: "80px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#FEE2E2", lineHeight: 1.45 }}>
                    <strong>Son (Cloned Voice):</strong> "{dialogHistory[dialogHistory.length - 1]?.sender === "scammer" ? dialogHistory[dialogHistory.length - 1]?.text : currentStage.scammer}"
                  </p>
                </div>
              </div>
            )}

            {/* WhatsApp Group chat Mock */}
            {activeScenario.kind === "whatsapp-chat" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0A0F1A" }}>
                {/* Group Info Header */}
                <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--surface-border)", display: "flex", alignItems: "center", gap: "9px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "13px" }}>VIP Wealth Creators</h4>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>Manoj, Riya, Admin, +247 members</span>
                  </div>
                </div>

                <div className="ss-sim-thread" style={{ padding: "14px", flex: 1 }}>
                  {/* Prepopulated chat activity */}
                  <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "8px", padding: "8px 12px", fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "10px", textAlign: "center" }}>
                    Admin shared a photo: "SEBI_CERTIFICATE_APPROVED.jpg"
                  </div>
                  {dialogHistory.map((m, i) => (
                    <div key={i} className={`ss-sim-msg ${m.sender === "scammer" ? "scammer" : "user"}`} style={{
                      alignSelf: m.sender === "scammer" ? "flex-start" : "flex-end"
                    }}>
                      <div style={{ fontSize: "10px", color: "var(--accent-strong)", fontWeight: "600", marginBottom: "2px" }}>
                        {m.sender === "scammer" ? "Group Admin (SEBI)" : "You"}
                      </div>
                      {m.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="ss-sim-msg scammer" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="ss-spinner" />
                      <span>Admin is posting document links...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            {/* UPI QR scanning overlay mock */}
            {showQrScanOverlay && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", padding: "20px" }}>
                <QrCode size={90} style={{ animation: "pulse 1s infinite" }} />
                <h3 style={{ marginTop: "20px", color: "white" }}>Scanning QR Code...</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>Reading payment authorization node in sandbox</p>
                <div style={{ width: "200px", height: "4px", background: "var(--surface-border)", borderRadius: "2px", overflow: "hidden", marginTop: "14px" }}>
                  <div style={{ height: "100%", width: "70%", background: "var(--accent-strong)", animation: "ss-spin 2s linear infinite" }} />
                </div>
              </div>
            )}

            {/* GPay PIN Pad modal */}
            {showUpiPinPad && (
              <div style={{ position: "absolute", inset: 0, background: "#111827", zIndex: 15, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "14px", color: "white" }}>State Bank of India</h3>
                  <button onClick={() => setShowUpiPinPad(false)} style={{ background: "none", border: "none", color: "white" }}>
                    <X size={18} />
                  </button>
                </div>
                
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paying Merchant</span>
                  <h2 style={{ fontSize: "24px", color: "white", margin: "4px 0" }}>₹5,000</h2>
                  <p style={{ fontSize: "12.5px", color: "#FCA5A5", fontWeight: "600" }}>⚠️ WARNING: ENTERING PIN DEBITS YOUR ACCOUNT</p>
                  
                  {/* PIN Dots indicators */}
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center", margin: "24px 0" }}>
                    {[0, 1, 2, 3].map((idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          width: "16px", 
                          height: "16px", 
                          borderRadius: "50%", 
                          border: "2.5px solid white", 
                          background: upiPinDigits.length > idx ? "white" : "transparent",
                          transition: "all 0.15s"
                        }} 
                      />
                    ))}
                  </div>
                </div>

                {/* Keypad Grid */}
                <div style={{ background: "#1F2937", padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", maxWidth: "280px", margin: "0 auto" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                      <button 
                        key={val} 
                        style={{ height: "46px", background: "#374151", border: "none", borderRadius: "8px", color: "white", fontSize: "17px", fontWeight: "600" }}
                        onClick={() => handleUpiPinKeyPress(val.toString())}
                      >
                        {val}
                      </button>
                    ))}
                    <button 
                      style={{ height: "46px", background: "#4B5563", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600" }}
                      onClick={() => setUpiPinDigits("")}
                    >
                      Clear
                    </button>
                    <button 
                      style={{ height: "46px", background: "#374151", border: "none", borderRadius: "8px", color: "white", fontSize: "17px", fontWeight: "600" }}
                      onClick={() => handleUpiPinKeyPress("0")}
                    >
                      0
                    </button>
                    <button 
                      style={{ height: "46px", background: "#B91C1C", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600" }}
                      onClick={() => setShowUpiPinPad(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Controls / Options Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card style={{ padding: "16px" }}>
              <div className="ss-card-title"><HelpCircle size={15} /> Defensive Options</div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                Practice analyzing scam signals. Click a choice card below to respond, or end the interaction safely.
              </p>

              {/* Special UPI Scan QR trigger */}
              {activeScenario.id === "upi-refund" && currentStageIndex === 1 && (
                <button 
                  className="ss-btn-primary" 
                  style={{ width: "100%", marginBottom: "10px", background: "#DC2626" }}
                  onClick={handleScanQrCode}
                  disabled={isTyping}
                >
                  <QrCode size={14} style={{ display: "inline", marginRight: "6px" }} /> Scan QR & Enter UPI PIN
                </button>
              )}

              {/* Multiple Choice Options */}
              <div className="ss-sim-options">
                {currentStage.choices.map((choice) => (
                  <button
                    key={choice.id}
                    className="ss-sim-option"
                    style={{ 
                      padding: "10px 12px", 
                      fontSize: "12.5px", 
                      lineHeight: "1.4", 
                      borderLeft: choice.type === "exit" ? "3px solid var(--safe)" : choice.type === "fail" ? "3px solid var(--danger)" : "1px solid var(--surface-border)"
                    }}
                    onClick={() => handleBranchingChoice(choice)}
                    disabled={isTyping}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </Card>

            <Card style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "13.5px", color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldAlert size={14} /> Critical Security Action
              </h4>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "6px 0 12px" }}>
                If you suspect a scam, do not engage. Real police, banks, and customs officers will never coerce you over video calls or message threads.
              </p>
              
              <button 
                className="ss-btn-primary" 
                onClick={handleImmediateEscape} 
                style={{ background: "#DC2626", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                🔒 I recognize this as a scam — End Call
              </button>
            </Card>

            {/* Dynamic Pressure Gauge widget */}
            <Card style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>Psychological Stress</span>
                <span style={{ fontSize: "13px", fontFamily: "monospace", color: getPressureColor(), fontWeight: "700" }}>{pressure}%</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--surface-border)" }}>
                <div style={{ height: "100%", width: `${pressure}%`, backgroundColor: getPressureColor(), transition: "width 0.4s ease" }} />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "6px", textAlign: "right" }}>
                Status: <strong>{getPressureLabel()}</strong>
              </span>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Legacy/Alternative Live AI simulation View
  if (simulationType === "live" && activeScenario) {
    const getLivePressureColor = () => {
      if (pressure < 35) return "#10B981";
      if (pressure < 70) return "#F59E0B";
      return "#EF4444";
    };

    return (
      <div className="ss-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="ss-link-btn" onClick={exitSimulation}>
            <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> End Simulation
          </button>
          <Badge tone="danger">Live AI Simulated Scam Call</Badge>
        </div>

        <div className="ss-grid-2" style={{ gridTemplateColumns: "1.8fr 1fr", gap: "20px" }}>
          {/* Main Chat Area */}
          <Card className="ss-sim-chat-window">
            <div className="ss-sim-meta-header">
              <div className="ss-sim-meta-item">
                <strong>Simulating:</strong> {activeScenario.title}
              </div>
              <div className="ss-sim-pressure-meter">
                <span style={{ fontSize: "11px", fontWeight: "600" }}>Stress level:</span>
                <div className="ss-sim-pressure-bar">
                  <div className="ss-sim-pressure-fill" style={{ width: `${pressure}%`, backgroundColor: getLivePressureColor() }} />
                </div>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: getLivePressureColor(), fontWeight: "700" }}>{pressure}%</span>
              </div>
            </div>

            {liveOutcome !== "done" ? (
              <>
                <div className="ss-sim-thread">
                  {messages.map((m, i) => (
                    <div key={i} className={`ss-sim-msg ${m.from}`}>
                      {m.text}
                    </div>
                  ))}
                  {waitingForScammer && (
                    <div className="ss-sim-msg scammer" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="ss-spinner" style={{ width: "10px", height: "10px" }} />
                      <span>Scammer is typing...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {liveOutcome === "evaluating" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 0", borderTop: "1px solid var(--surface-border)" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <span className="ss-spinner" />
                      <span>AI Safety Officer generating debrief report...</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "12px" }}>
                    <div className="ss-sim-input-row">
                      <input
                        className="ss-input"
                        placeholder="Type your response to the caller..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendLiveMessage()}
                        disabled={waitingForScammer}
                      />
                      <button className="ss-btn-primary ss-btn-icon" onClick={handleSendLiveMessage} disabled={waitingForScammer || !userInput.trim()}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Simulation complete, display debrief
              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", padding: "10px 0" }}>
                {evaluation ? (
                  <div className="ss-sim-debrief-card">
                    <div className="ss-sim-debrief-score-row">
                      <div style={{ width: "120px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Survival Score</span>
                        <h2 style={{ fontSize: "40px", fontFamily: "monospace", color: evaluation.passed ? "var(--safe-strong)" : "var(--danger)", margin: "4px 0" }}>
                          {evaluation.score}
                        </h2>
                        <Badge tone={evaluation.passed ? "safe-strong" : "danger"}>
                          {evaluation.passed ? "Resisted" : "Scammed"}
                        </Badge>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3>AI Safety Performance Debrief</h3>
                        <p style={{ marginTop: "4px", fontSize: "13px" }}>{evaluation.debriefText}</p>
                      </div>
                    </div>

                    <div className="ss-explain-grid">
                      <div className="ss-why-box" style={{ background: "rgba(34, 197, 94, 0.05)", borderColor: "rgba(34,197,94,0.15)" }}>
                        <div className="ss-explain-label safe"><ShieldCheck size={13} style={{ display: "inline", marginRight: "4px" }} /> Safe Decisions</div>
                        {evaluation.strengths?.length > 0 ? (
                          <ul style={{ margin: "5px 0", paddingLeft: "16px", fontSize: "12.5px" }}>
                            {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        ) : <p style={{ fontSize: "12px" }}>No active resistance demonstrated.</p>}
                      </div>
                      <div className="ss-why-box" style={{ background: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239,68,68,0.15)" }}>
                        <div className="ss-explain-label warning"><AlertTriangle size={13} style={{ display: "inline", marginRight: "4px" }} /> Risks Taken</div>
                        {evaluation.weaknesses?.length > 0 ? (
                          <ul style={{ margin: "5px 0", paddingLeft: "16px", fontSize: "12.5px" }}>
                            {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                          </ul>
                        ) : <p style={{ fontSize: "12px" }}>No structural safety mistakes made.</p>}
                      </div>
                    </div>

                    <div className="ss-sim-debrief-actions">
                      <button className="ss-btn-primary" onClick={exitSimulation} style={{ flex: 1 }}>Finish Simulation</button>
                      <button className="ss-btn-secondary" onClick={() => startLiveSimulation(activeScenario)} style={{ flex: 1 }}>Try Again</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
                    <AlertTriangle size={32} className="ss-icon-warning" />
                    <h3>Evaluation Corrupted</h3>
                    <p>Unable to retrieve report details. Return to Simulation Lab.</p>
                    <button className="ss-btn-primary" onClick={exitSimulation}>Close</button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions Panel */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px", height: "fit-content" }}>
            <div className="ss-card-title"><HelpCircle size={15} /> Defensive Options</div>
            <p style={{ fontSize: "12px" }}>Select a safety action when you identify the scam pattern. Or continue messaging to practice negotiation details.</p>
            
            <button className="ss-btn-primary" onClick={handleLiveHangUp} disabled={liveOutcome !== null} style={{ background: "var(--safe)" }}>
              🔒 Disconnect Call (Safe Exit)
            </button>
            <div style={{ borderTop: "1px solid var(--surface-border)", margin: "8px 0" }} />
            
            <button className="ss-btn-secondary" onClick={() => handleLiveTriggerAction("pay")} disabled={liveOutcome !== null} style={{ borderColor: "rgba(239,68,68,0.4)" }}>
              💸 Transfer Rs. 98,000 (Comply)
            </button>
            <button className="ss-btn-secondary" onClick={() => handleLiveTriggerAction("otp")} disabled={liveOutcome !== null} style={{ borderColor: "rgba(239,68,68,0.4)" }}>
              🔑 Provide OTP Code (Share PIN)
            </button>
            <button className="ss-btn-secondary" onClick={() => handleLiveTriggerAction("id")} disabled={liveOutcome !== null} style={{ borderColor: "rgba(239,68,68,0.4)" }}>
              🪪 Send Aadhaar ID Details
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard Home View
  return (
    <div className="ss-page">
      <SectionHeading eyebrow="Simulation Lab" title="Build Immunity by Safe Experience" />

      {/* Sandboxed Warning Banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "10px", padding: "12px 16px", color: "var(--text)" }}>
        <Info size={18} className="ss-icon-accent" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "13px" }}>
          <strong>Educational Sandbox Notice:</strong> No real money, personal details, or financial accounts are ever used in these simulations. Do not input real banking credentials, PINs, or OTPs.
        </div>
      </div>

      <div className="ss-heuristic-note">
        <Info size={13} /> 
        {ollamaAvailable 
          ? "Ollama local LLM is online! Live AI Scammer Simulations are available. You can practice chatting against freeform threats."
          : "Ollama is offline. You can run the Sandbox Branching simulations below, or boot up Ollama to enable free-text Live AI chats."}
      </div>

      <div className="ss-grid-3">
        {SCENARIOS.map((s) => {
          const stats = getScenarioStats(s.id);
          return (
            <Card key={s.id} className="ss-scenario-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <s.icon size={24} className="ss-icon-accent" />
                <div style={{ display: "flex", gap: "5px" }}>
                  {stats.completed ? (
                    <Badge tone="safe-strong" icon={CheckCircle2}>Completed</Badge>
                  ) : (
                    <Badge tone="info">Not Started</Badge>
                  )}
                  <Badge tone={s.difficulty === "Hard" ? "danger" : s.difficulty === "Medium" ? "warning" : "safe"}>
                    {s.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="ss-card-title" style={{ marginTop: "6px", fontSize: "15px" }}>{s.title}</div>
              <p className="ss-scenario-desc" style={{ flex: 1, fontSize: "12.5px", margin: "6px 0 14px", color: "var(--text-muted)", lineHeight: 1.45 }}>{s.desc}</p>
              
              {/* Score indicators */}
              {stats.completed && (
                <div style={{ marginBottom: "12px", background: "var(--surface-2)", borderRadius: "8px", padding: "6px 10px", fontSize: "11.5px", display: "flex", justifyContent: "space-between" }}>
                  <span>Best Score: <strong style={{ color: "var(--safe-strong)" }}>{stats.bestScore}/100</strong></span>
                  <span>Attempts: <strong style={{ color: "var(--accent-strong)" }}>{stats.attempts}</strong></span>
                </div>
              )}

              <div className="ss-scenario-footer" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "12px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Est. Time: {s.estMinutes} min</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="ss-btn-primary"
                    onClick={() => startBranchingSimulation(s)}
                    style={{ width: "auto", margin: "0", padding: "7px 12px", fontSize: "12px" }}
                    aria-label={`Start practice for ${s.title}`}
                  >
                    Practice
                  </button>
                  <button
                    className="ss-btn-secondary"
                    onClick={() => startLiveSimulation(s)}
                    disabled={!ollamaAvailable}
                    style={{ width: "auto", margin: "0", padding: "6px 12px", fontSize: "12px" }}
                    aria-label={`Start live AI chat for ${s.title}`}
                  >
                    Live AI
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
