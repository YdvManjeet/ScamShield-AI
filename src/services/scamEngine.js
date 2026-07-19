import {
  Phone, CreditCard, QrCode, Package, Zap, Briefcase, KeyRound
} from "lucide-react";

export const SCORE_WEIGHTS = {
  awareness: 0.25,
  digitalBehaviour: 0.20,
  paymentSafety: 0.20,
  simulationPerformance: 0.20,
  responseReadiness: 0.15,
};

export const COMPONENT_LABELS = {
  awareness: "Scam Awareness",
  digitalBehaviour: "Digital Behaviour",
  paymentSafety: "Payment Safety",
  simulationPerformance: "Simulation Performance",
  responseReadiness: "Response Readiness",
};

export const RAW_COMPONENT_DATA = {
  awareness: {
    value: 70,
    basis: "12 of 15 onboarding awareness questions answered correctly",
  },
  digitalBehaviour: {
    value: 61,
    basis: "3 risky app permissions granted, 2FA enabled on 2 of 4 linked accounts",
  },
  paymentSafety: {
    value: 66,
    basis: "No unverified UPI payments in 90 days, 1 QR scan flagged by Scanner",
  },
  simulationPerformance: {
    value: 58,
    basis: "2 of 4 completed simulations passed without falling for the scam",
  },
  responseReadiness: {
    value: 72,
    basis: "Correctly identified reporting channel in 4 of 5 mission checks",
  },
};

export const SCORE_HISTORY = [
  { month: "Feb", score: 41 },
  { month: "Mar", score: 46 },
  { month: "Apr", score: 52 },
  { month: "May", score: 55 },
  { month: "Jun", score: 57 },
  { month: "Jul", score: 65 },
];

export const TRENDING_SCAMS = [
  { id: 1, title: "Fake 'Digital Arrest' video calls impersonating CBI", region: "Nationwide", severity: "critical", reports: 1284, icon: Phone },
  { id: 2, title: "FedEx/courier parcel held at customs — pay to release", region: "Metro cities", severity: "high", reports: 842, icon: Package },
  { id: 3, title: "Electricity bill disconnection SMS with payment link", region: "North & West India", severity: "high", reports: 611, icon: Zap },
  { id: 4, title: "QR code 'refund' scams at merchant counters", region: "Tier-1 cities", severity: "medium", reports: 398, icon: QrCode },
  { id: 5, title: "Fake job offer requesting security deposit", region: "Nationwide", severity: "medium", reports: 356, icon: Briefcase },
  { id: 6, title: "SIM blocking via fraudulent KYC update call", region: "South India", severity: "high", reports: 470, icon: KeyRound },
];

export const REGION_HEATMAP = [
  { region: "Delhi NCR", count: 312, level: "critical" },
  { region: "Maharashtra", count: 289, level: "critical" },
  { region: "Karnataka", count: 244, level: "high" },
  { region: "Telangana", count: 198, level: "high" },
  { region: "Tamil Nadu", count: 176, level: "high" },
  { region: "Uttar Pradesh", count: 231, level: "high" },
  { region: "West Bengal", count: 142, level: "medium" },
  { region: "Gujarat", count: 119, level: "medium" },
  { region: "Rajasthan", count: 96, level: "medium" },
  { region: "Punjab", count: 88, level: "medium" },
  { region: "Kerala", count: 74, level: "low" },
  { region: "Bihar", count: 61, level: "low" },
];

export const MISSIONS = [
  { id: "m1", title: "Spot the fake CBI call", desc: "Learn the 5 things real police never do on a phone call.", minutes: 4, component: "awareness", gain: 3, done: true },
  { id: "m2", title: "Secure your UPI app", desc: "Walk through enabling app-lock and transaction alerts.", minutes: 5, component: "paymentSafety", gain: 4, done: false },
  { id: "m3", title: "Digital Arrest simulation", desc: "Live through a simulated 'digital arrest' video call safely.", minutes: 6, component: "simulationPerformance", gain: 6, done: false },
  { id: "m4", title: "Reporting in under 60 seconds", desc: "Practice the exact steps to report on cybercrime.gov.in / 1930.", minutes: 3, component: "responseReadiness", gain: 3, done: false },
  { id: "m5", title: "QR codes: scan safely", desc: "Understand why a QR code can never 'send' you money.", minutes: 3, component: "digitalBehaviour", gain: 3, done: false },
];

export const SAFETY_CIRCLE_SEED = [
  { id: "c1", name: "Ramesh Sharma", relation: "Father", phone: "98xxxxxx12", status: "protected", lastActivity: "Scanned a suspicious SMS 2 days ago — correctly reported it" },
  { id: "c2", name: "Sunita Sharma", relation: "Mother", phone: "98xxxxxx45", status: "at-risk", lastActivity: "Received a 'digital arrest' style call yesterday — no action taken yet" },
];

export const IMPROVEMENT_ACTIONS = {
  awareness: "Complete the 'Spot the fake CBI call' mission to sharpen scam-pattern recognition.",
  digitalBehaviour: "Turn on two-factor authentication for your remaining linked accounts.",
  paymentSafety: "Run any new payment QR code through the Scam Scanner before paying.",
  simulationPerformance: "Retry the Digital Arrest simulation — you paused at the payment demand last time.",
  responseReadiness: "Practice the reporting mission so you know the exact steps under pressure.",
};

export const STRENGTH_NOTES = {
  awareness: "You correctly recognise most common scam scripts.",
  digitalBehaviour: "Your day-to-day digital habits are mostly safe.",
  paymentSafety: "You verify most payments before completing them.",
  simulationPerformance: "You keep a level head during simulated pressure scenarios.",
  responseReadiness: "You know where and how to report incidents quickly.",
};

export const PROFILE_OPTIONS = {
  ageRanges: ["18–25", "26–40", "41–60", "60+"],
  languages: ["English", "हिंदी", "தமிழ்", "తెలుగు", "বাংলা", "मराठी", "ગુજરાતી", "ಕನ್ನಡ"],
  digitalComfort: ["Beginner", "Comfortable", "Advanced"],
  activities: ["UPI payments", "Online banking", "WhatsApp", "Social media", "Online shopping", "Investment apps"],
};

export const ONBOARDING_SCENARIOS = [
  {
    id: "sc1", category: "responseReadiness", title: "The 'Digital Arrest' Call",
    prompt: "You receive a video call from someone in a police uniform claiming to be a CBI officer. They say your Aadhaar is linked to a money-laundering case and you must stay on the video call until the 'investigation' is complete.",
    choices: [
      { id: "a", text: "Follow instructions since CBI is involved", delta: -14, explanation: "Real police and CBI never conduct arrests, investigations, or trials over a video call. This is the single most common 'digital arrest' scam pattern." },
      { id: "b", text: "Ask for their ID and continue the call", delta: -6, explanation: "Fraudsters carry convincing fake ID cards on screen. Staying on the call at all keeps you inside their pressure tactic." },
      { id: "c", text: "Disconnect and independently verify through official channels", delta: 14, explanation: "Correct. Hang up and call the agency's number from their official website — never a number the caller gives you." },
      { id: "d", text: "Transfer money if they ask for a refundable 'verification deposit'", delta: -14, explanation: "No agency ever asks for money to 'prove innocence'. This is the payment step of the scam." },
    ],
  },
  {
    id: "sc2", category: "paymentSafety", title: "The 'Refund' QR Code",
    prompt: "Someone messages saying they accidentally sent you ₹5,000 and asks you to scan a QR code and enter your UPI PIN to 'receive' the refund.",
    choices: [
      { id: "a", text: "Scan the code and enter your PIN to get the money", delta: -14, explanation: "Entering a UPI PIN always sends money — never receives it. This is a classic reverse-QR scam." },
      { id: "b", text: "Check your bank statement for the claimed transfer first", delta: 4, explanation: "A good instinct, but you should also recognise the technical fact: no PIN is ever needed to receive money." },
      { id: "c", text: "Reply asking them to send it through normal UPI transfer instead", delta: -6, explanation: "Better than scanning blindly, but this still engages with the scammer rather than shutting the interaction down." },
      { id: "d", text: "Ignore it — receiving money never requires scanning a code or entering a PIN", delta: 14, explanation: "Correct. Receiving UPI payments needs no PIN entry at all." },
    ],
  },
  {
    id: "sc3", category: "awareness", title: "The SIM Blocking Threat",
    prompt: "You get a message: 'Your SIM will be permanently blocked in 2 hours due to KYC non-compliance. Call this TRAI officer immediately to avoid disconnection.'",
    choices: [
      { id: "a", text: "Call the number immediately — losing your SIM would be a disaster", delta: -14, explanation: "The urgency is manufactured. TRAI does not block SIMs by SMS threat or resolve KYC over a phone call." },
      { id: "b", text: "Message the number back asking for more details", delta: -6, explanation: "Engaging at all confirms your number is active and opens the door to further manipulation." },
      { id: "c", text: "Check directly with your telecom operator's official app or helpline", delta: 14, explanation: "Correct. Verify any account-status claim only through the official channel you already trust." },
      { id: "d", text: "Wait and see if the SIM actually gets blocked", delta: 4, explanation: "Not dangerous, but doesn't build the habit of proactively verifying — and won't stop you being fooled next time." },
    ],
  },
  {
    id: "sc4", category: "responseReadiness", title: "The Courier-to-Police Transfer",
    prompt: "A 'courier company representative' says illegal items were found in a parcel linked to your Aadhaar, then 'transfers' you to a police officer on the same call.",
    choices: [
      { id: "a", text: "Stay on the line — being transferred to police seems official", delta: -14, explanation: "The seamless 'transfer' between courier and 'police' is a scripted scare tactic, not a real inter-agency process." },
      { id: "b", text: "Provide your Aadhaar number so they can 'clear your name'", delta: -14, explanation: "This hands the scammer exactly the identity details they're trying to exploit." },
      { id: "c", text: "End the call and report it via cybercrime.gov.in / 1930", delta: 14, explanation: "Correct. This is textbook courier-scam-to-digital-arrest escalation — disconnect and report." },
      { id: "d", text: "Ask them to send official documents by post first", delta: 4, explanation: "A reasonable stall, but real law enforcement doesn't operate this way at all — better to disconnect outright." },
    ],
  },
  {
    id: "sc5", category: "paymentSafety", title: "The Bank 'Verification' Call",
    prompt: "A caller claiming to be from your bank's fraud department says a suspicious transaction was blocked, and asks you to read out the OTP you just received to 'cancel' it.",
    choices: [
      { id: "a", text: "Read out the OTP so the suspicious transaction gets cancelled", delta: -14, explanation: "No bank ever needs your OTP to cancel or block anything — this is how the actual fraudulent transaction goes through." },
      { id: "b", text: "Ask them to verify your name and account number first", delta: -6, explanation: "This still keeps you engaged with the caller instead of independently verifying through the bank." },
      { id: "c", text: "Hang up and call the number on the back of your card", delta: 14, explanation: "Correct. Banks never call and ask for an OTP — verify independently every time." },
      { id: "d", text: "Give the last 4 digits of the OTP only", delta: -6, explanation: "Partial OTP sharing is still sharing — scammers can often work with fragments plus other details." },
    ],
  },
  {
    id: "sc6", category: "digitalBehaviour", title: "The Guaranteed-Returns Group",
    prompt: "A WhatsApp group you were added to shows daily 'profit screenshots' and promises guaranteed 30% monthly returns if you deposit through their app.",
    choices: [
      { id: "a", text: "Start with a small deposit to test it", delta: -14, explanation: "Any 'guaranteed' high return is a red flag — these apps often show fake profits to encourage larger deposits, then block withdrawals." },
      { id: "b", text: "Ask other group members if it's worked for them", delta: -6, explanation: "Other members are frequently scam accomplices or bots — social proof inside the group can't be trusted." },
      { id: "c", text: "Leave the group and don't engage with the investment app", delta: 14, explanation: "Correct. No legitimate investment guarantees fixed high returns — SEBI-registered platforms never operate like this." },
      { id: "d", text: "Research the company name online before deciding", delta: 4, explanation: "A sensible check, though these operations often use cloned or fabricated company names that pass a shallow search." },
    ],
  },
  {
    id: "sc7", category: "digitalBehaviour", title: "The Remote-Access 'Support' Call",
    prompt: "Someone claiming to be tech support for a payment app you use asks you to install a screen-sharing app so they can 'fix an error' on your account.",
    choices: [
      { id: "a", text: "Install the app so they can see and fix the issue", delta: -14, explanation: "Screen-sharing apps give the caller full visibility of your banking apps, OTPs, and PINs in real time." },
      { id: "b", text: "Ask them to guide you through the fix over the phone instead", delta: 14, explanation: "Correct. Legitimate support never needs to remotely control your device — voice guidance is enough for real issues." },
      { id: "c", text: "Install it but keep the banking app closed", delta: -6, explanation: "Once remote access is granted, the attacker controls what's opened — closing an app first doesn't protect you." },
      { id: "d", text: "Uninstall the payment app entirely to be safe", delta: 4, explanation: "Overcautious but not harmful — the real fix is simply refusing remote access, not removing the app." },
    ],
  },
  {
    id: "sc8", category: "awareness", title: "The AI-Cloned Family Voice",
    prompt: "You get a call in what sounds exactly like your son's voice, panicked, saying he's been in an accident and urgently needs money sent to a new account.",
    choices: [
      { id: "a", text: "Send the money immediately — you recognised his voice", delta: -14, explanation: "AI voice cloning can now convincingly mimic a family member from a few seconds of audio. Urgency plus a familiar voice is a well-known manipulation combo." },
      { id: "b", text: "Ask a question only the real person would know, and call them back directly", delta: 14, explanation: "Correct. Verify through a second channel or a shared detail before acting on any urgent money request." },
      { id: "c", text: "Send a smaller amount first to be safe", delta: -6, explanation: "Any transfer before verification still reaches the scammer — the amount doesn't matter." },
      { id: "d", text: "Ask them to send the request in writing over WhatsApp", delta: 4, explanation: "A reasonable instinct, but the safest move is independently reaching the actual person, not just a different message channel." },
    ],
  },
  {
    id: "sc9", category: "paymentSafety", title: "The Job Offer Deposit",
    prompt: "You're offered a well-paying work-from-home job, but HR says you must first pay a ₹2,000 'refundable security deposit' to receive your starter kit.",
    choices: [
      { id: "a", text: "Pay the deposit — the salary offered is worth it", delta: -14, explanation: "Legitimate employers never ask candidates to pay money upfront for a job, refundable or not." },
      { id: "b", text: "Ask for the deposit to be adjusted against the first salary instead", delta: -6, explanation: "Still agreeing to pay upfront in some form — real employers don't require this at all." },
      { id: "c", text: "Decline and verify the company through its official careers page", delta: 14, explanation: "Correct. Any upfront payment requirement is disqualifying on its own." },
      { id: "d", text: "Ask other applicants in the hiring group if they paid too", delta: 4, explanation: "A check worth doing, but note that 'other applicants' in scam hiring groups are frequently fake accounts." },
    ],
  },
  {
    id: "sc10", category: "awareness", title: "The Fake Government Portal",
    prompt: "A search result leads you to a page that looks like an official government portal, offering to 'process your pending refund' if you enter your bank details.",
    choices: [
      { id: "a", text: "Enter your bank details to claim the refund", delta: -14, explanation: "Fake portals mimicking government sites are a common phishing method — always check the URL is the genuine .gov.in domain." },
      { id: "b", text: "Enter only your name and phone number, not banking details", delta: -6, explanation: "Even partial details on a fake portal feed a scammer's profile of you for later targeting." },
      { id: "c", text: "Navigate to the real portal by typing the official URL directly", delta: 14, explanation: "Correct. Always reach government portals by typing the known official address, never by clicking a search or SMS link." },
      { id: "d", text: "Bookmark the page and come back to it later", delta: 4, explanation: "Doesn't cause immediate harm, but doesn't address the core risk — the page itself is fraudulent regardless of when you return." },
    ],
  },
];

export const SEED_SCORE_EVENTS = [
  { id: "seed1", category: "awareness", delta: 5, reason: "Completed Digital Arrest Awareness Training", timestamp: "2026-02-14T10:00:00.000Z" },
  { id: "seed2", category: "paymentSafety", delta: 3, reason: "Correctly identified a fake UPI refund request", timestamp: "2026-03-08T09:30:00.000Z" },
  { id: "seed3", category: "simulationPerformance", delta: -4, reason: "Fell for a simulated courier scam call", timestamp: "2026-03-22T14:12:00.000Z" },
  { id: "seed4", category: "responseReadiness", delta: 4, reason: "Completed the cybercrime.gov.in reporting mission", timestamp: "2026-04-19T11:45:00.000Z" },
  { id: "seed5", category: "digitalBehaviour", delta: 3, reason: "Enabled two-factor authentication on a linked account", timestamp: "2026-05-11T16:20:00.000Z" },
  { id: "seed6", category: "paymentSafety", delta: 2, reason: "Scam Scanner correctly flagged a phishing SMS", timestamp: "2026-06-03T08:55:00.000Z" },
  { id: "seed7", category: "awareness", delta: 3, reason: "Completed the QR code safety mission", timestamp: "2026-06-27T13:10:00.000Z" },
];

export const SIMULATION_LIBRARY = [
  { id: "digital-arrest", title: "Digital Arrest", difficulty: "Hard", estMinutes: 4, kind: "flagship", persona: "Officer Arjun Mehta · Cyber Crime Unit" },
  { id: "upi-refund", title: "Fake UPI Refund", difficulty: "Medium", estMinutes: 2, kind: "flagship", persona: "Unknown buyer · UPI chat" },
  { id: "courier", title: "Courier / FedEx Scam", difficulty: "Hard", estMinutes: 2, kind: "simple" },
  { id: "bank-kyc", title: "Fake Bank KYC", difficulty: "Medium", estMinutes: 2, kind: "simple" },
  { id: "ai-voice", title: "AI Voice Family Emergency", difficulty: "Advanced", estMinutes: 2, kind: "simple" },
  { id: "investment-group", title: "Investment WhatsApp Group", difficulty: "Medium", estMinutes: 2, kind: "simple" },
];

export const DIGITAL_ARREST_STAGES = [
  {
    id: "authority", label: "Authority", tacticLabel: "Authority impersonation",
    scammer: "Am I speaking with you? This is Officer Arjun Mehta from the Cyber Crime Investigation Unit. We have recovered a SIM card registered using your Aadhaar details in connection with a money-laundering investigation.",
    choices: [
      { id: "a", text: "What happened? Please explain.", type: "cautious", pressure: 8 },
      { id: "b", text: "Can you prove who you are? Send me your official ID.", type: "cautious", pressure: 5 },
      { id: "c", text: "I will disconnect and verify independently through the official helpline.", type: "exit", pressure: 0 },
      { id: "d", text: "I will cooperate. Tell me what to do.", type: "unsafe", pressure: 15 },
    ],
    continueReply: "Good. This is a serious matter and I need your full cooperation to resolve it quickly.",
  },
  {
    id: "fear", label: "Fear", tacticLabel: "Fear-based pressure",
    scammer: "If you do not cooperate immediately, we will issue an arrest warrant and freeze all your bank accounts within the hour. This is a serious criminal case.",
    choices: [
      { id: "a", text: "This sounds like a threat — real police don't work this way. I'm ending this call.", type: "exit", pressure: 0 },
      { id: "b", text: "Please don't arrest me — what do I need to do?", type: "unsafe", pressure: 18 },
      { id: "c", text: "I want to speak to a lawyer before continuing.", type: "cautious", pressure: 6 },
      { id: "d", text: "Send me the official case documents first.", type: "cautious", pressure: 6 },
    ],
    continueReply: "There is no time for lawyers. Listen carefully to what I say next.",
  },
  {
    id: "isolation", label: "Isolation", tacticLabel: "Isolation attempt",
    scammer: "Do not tell your family or anyone else about this call. This investigation is strictly confidential — informing anyone could implicate them too.",
    choices: [
      { id: "a", text: "That's not how real investigations work. I'm calling my family and ending this now.", type: "exit", pressure: 0 },
      { id: "b", text: "Okay, I won't tell anyone.", type: "unsafe", pressure: 20 },
      { id: "c", text: "I need a moment to think about this alone.", type: "cautious", pressure: 8 },
    ],
    continueReply: "Good. Now stay focused — we don't have much time left.",
  },
  {
    id: "control", label: "Control", tacticLabel: "Remote-access / control request",
    scammer: "To proceed with verification, stay on this video call continuously and install this screen-sharing app so we can monitor your account activity in real time.",
    choices: [
      { id: "a", text: "I will not install anything or share my screen. This is where I draw the line.", type: "exit", pressure: 0 },
      { id: "b", text: "Okay, installing it now.", type: "unsafe", pressure: 22 },
      { id: "c", text: "Why do you need remote access for a verification call?", type: "cautious", pressure: 10 },
    ],
    continueReply: "It's standard procedure. Now, for the final step —",
  },
  {
    id: "money", label: "Money", tacticLabel: "Financial extraction",
    scammer: "For final verification, and to prove your funds are legitimately yours, transfer ₹1,00,000 to this RBI-monitored 'safe account'. It will be refunded within 24 hours once cleared.",
    choices: [
      { id: "a", text: "No legitimate agency ever asks for money like this. I'm ending this call and reporting it.", type: "exit", pressure: 0 },
      { id: "b", text: "I need to verify this with my bank first — I'm not transferring anything.", type: "exit", pressure: 0 },
      { id: "c", text: "Okay, sending the transfer now.", type: "fail", pressure: 25 },
    ],
  },
];

export const UPI_REFUND_STAGES = [
  {
    id: "claim", label: "The Claim", tacticLabel: "False overpayment claim",
    scammer: "Hi! I think I accidentally sent you ₹5,000 instead of ₹500 for the item. Can you help me get it back? It's a bit urgent, my rent is due.",
    choices: [
      { id: "a", text: "Let me check my bank balance and statement first.", type: "cautious", pressure: 10 },
      { id: "b", text: "Oh no, sure — how do I send it back to you?", type: "unsafe", pressure: 15 },
      { id: "c", text: "I haven't received anything extra. I'll check my statement and get back to you.", type: "exit", pressure: 0 },
    ],
    continueReply: "Oh, it might take a moment to reflect. Meanwhile, let's speed this up —",
  },
  {
    id: "qr", label: "The QR Request", tacticLabel: "UPI PIN request disguised as refund",
    scammer: "Here, scan this QR code and enter your UPI PIN — that's how you'll be able to send my ₹5,000 back to me quickly.",
    choices: [
      { id: "a", text: "Scanning a QR and entering my PIN is for sending money, not receiving — I won't do that.", type: "exit", pressure: 0 },
      { id: "b", text: "Okay, scanning it now and entering my PIN.", type: "fail", pressure: 30 },
      { id: "c", text: "Why would I need to enter my PIN to give you back money you sent?", type: "cautious", pressure: 8 },
    ],
  },
];

export const SIMPLE_SIMULATIONS = {
  courier: {
    title: "Courier / FedEx Scam", tacticLabel: "Courier-to-police escalation",
    scammer: "This is FedEx Customer Care. A parcel under your name contains illegal items and has been seized by customs. I'm transferring your call to a police officer now.",
    choices: [
      { id: "a", text: "End the call and report it via cybercrime.gov.in / 1930.", type: "exit", pressure: 0 },
      { id: "b", text: "Provide your Aadhaar number so they can 'clear your name'.", type: "fail", pressure: 30 },
      { id: "c", text: "Stay on the line — being transferred to police seems official.", type: "unsafe", pressure: 25 },
    ],
  },
  "bank-kyc": {
    title: "Fake Bank KYC", tacticLabel: "Urgent KYC / account-block pressure",
    scammer: "Your bank account KYC is incomplete and will be permanently blocked in 2 hours. Share the OTP sent to your phone to complete verification immediately.",
    choices: [
      { id: "a", text: "Hang up and verify directly through the bank's official app or branch.", type: "exit", pressure: 0 },
      { id: "b", text: "Read out the OTP so the account doesn't get blocked.", type: "fail", pressure: 30 },
      { id: "c", text: "Ask them to confirm my registered branch first.", type: "cautious", pressure: 12 },
    ],
  },
  "ai-voice": {
    title: "AI Voice Family Emergency", tacticLabel: "AI-cloned voice urgency",
    scammer: "(A voice sounding exactly like your son, panicked) Mom/Dad, I've been in an accident — please send money right now to this account, I'll explain later!",
    choices: [
      { id: "a", text: "Ask a question only the real person would know, and call them back directly on their known number.", type: "exit", pressure: 0 },
      { id: "b", text: "Send the money immediately — you recognised the voice.", type: "fail", pressure: 30 },
      { id: "c", text: "Send a smaller amount first to be safe.", type: "unsafe", pressure: 22 },
    ],
  },
  "investment-group": {
    title: "Investment WhatsApp Group", tacticLabel: "Guaranteed-returns pitch",
    scammer: "Our members are earning guaranteed 30% monthly returns — deposit through this app today before the slots close!",
    choices: [
      { id: "a", text: "Leave the group and don't engage with the investment app.", type: "exit", pressure: 0 },
      { id: "b", text: "Start with a small deposit to test it.", type: "fail", pressure: 30 },
      { id: "c", text: "Ask other group members if it's worked for them.", type: "unsafe", pressure: 20 },
    ],
  },
};

export const SIGNAL_RULES = [
  { key: "authority_impersonation", label: "Authority impersonation", weight: 30, test: /\b(cbi|enforcement directorate|\bed\b|customs (officer|department)|trai officer|rbi (officer|verification)|income tax department|cyber cell officer)\b/i },
  { key: "threat", label: "Threat of arrest / legal action", weight: 24, test: /\b(warrant|arrest|legal action|case (has been|is) filed|criminal (case|charges)|fir (has been|will be) filed)\b/i },
  { key: "isolation_instruction", label: "Isolation instruction", weight: 20, test: /\b(do not (inform|tell|disconnect)|stay on (the )?call|don'?t hang up|keep this confidential|video call.*until)\b/i },
  { key: "urgency", label: "Artificial urgency", weight: 14, test: /\b(immediately|urgent(ly)?|within (\d+ )?(hour|minute)s?|right now|before it'?s too late|last chance)\b/i },
  { key: "otp_request", label: "OTP request", weight: 24, test: /\b(otp|one[- ]time password)\b/i },
  { key: "upi_pin_request", label: "UPI PIN request", weight: 22, test: /\b(upi pin|enter (your )?pin|scan.*(to receive|for refund))\b/i },
  { key: "financial_request", label: "Financial / payment demand", weight: 16, test: /\b(transfer|pay (now|immediately)?|deposit|processing fee|refundable (deposit|amount)|security deposit)\b/i },
  { key: "remote_access_request", label: "Remote access request", weight: 22, test: /\b(screen[- ]?shar(e|ing)|anydesk|teamviewer|remote access|install this app)\b/i },
  { key: "guaranteed_returns", label: "Guaranteed-returns pitch", weight: 18, test: /\b(guaranteed returns?|assured profit|\d{1,3}%\s?(monthly|daily|weekly) returns?)\b/i },
  { key: "suspicious_link", label: "Suspicious link pattern", weight: 14, test: /(bit\.ly|tinyurl|wa\.me|click here|verify.*account.*link|http:\/\/(?!.*www))/i },
  { key: "credential_request", label: "Credential / ID request", weight: 20, test: /\b(password|aadhaar number|card number|cvv|net banking (id|password))\b/i },
];

export const SIGNAL_EXPLANATIONS = {
  authority_impersonation: "it claims to be from a law-enforcement or government authority — a common cover used to make demands feel unquestionable",
  threat: "it threatens arrest or legal action, a pressure tactic real agencies do not use over call or message",
  isolation_instruction: "it tries to isolate you by asking you to stay on a call or not tell anyone, cutting off your ability to verify with someone you trust",
  urgency: "it manufactures urgency to stop you from pausing and thinking it through",
  otp_request: "it asks for an OTP, which no legitimate bank, agency, or company ever needs from you",
  upi_pin_request: "it asks you to enter a UPI PIN in a context where a PIN should never be required",
  financial_request: "it makes a direct financial demand, often disguised as a fee, deposit, or verification payment",
  remote_access_request: "it asks you to install remote-access software, which would hand over full control of your device",
  guaranteed_returns: "it promises guaranteed high returns, which no legitimate investment can ever assure",
  suspicious_link: "it contains a link pattern commonly used to disguise a phishing destination",
  credential_request: "it asks for sensitive credentials or ID numbers that should never be shared this way",
};

export const RISK_BANDS = [
  { max: 20, level: "low", label: "Low Risk", tone: "safe", verdictText: "No strong scam indicators detected" },
  { max: 45, level: "caution", label: "Caution", tone: "info", verdictText: "A few cautionary signals present" },
  { max: 70, level: "suspicious", label: "Suspicious", tone: "warning", verdictText: "Several suspicious patterns detected" },
  { max: 89, level: "high", label: "High Risk", tone: "danger", verdictText: "Strong scam indicators detected" },
  { max: 100, level: "critical", label: "Critical Risk", tone: "danger", verdictText: "Highly likely scam" },
];

export const OVERLAP_DAMPENING = [1, 0.85, 0.7, 0.55, 0.45, 0.35, 0.3];

export const ASSESSMENT_BASELINE = 50;

export const SIMULATION_PASS_SCHEDULE = [6, 3, 1, 0];
export const SIMULATION_FIRST_FAIL_PENALTY = -4;

export const SCAN_REWARD_CAP = 3;
export const SCAN_REWARD_VALUE = 2;

export const RECOMMENDED_ACTIONS_BASE = [
  "End the conversation.",
  "Do not transfer money.",
  "Do not install screen-sharing apps.",
  "Independently verify through official channels.",
  "Preserve evidence (screenshots, call logs, numbers used).",
  "Use official cybercrime reporting resources when appropriate — cybercrime.gov.in or 1930.",
];

export function calculateImmunityScore(components) {
  const total = Object.entries(SCORE_WEIGHTS).reduce(
    (sum, [key, weight]) => sum + (components[key]?.value ?? 0) * weight,
    0
  );
  return Math.round(total);
}

export function getScoreStatus(score) {
  if (score < 40) return { label: "Vulnerable", tone: "danger" };
  if (score < 60) return { label: "At Risk", tone: "warning" };
  if (score < 80) return { label: "Protected", tone: "safe" };
  return { label: "Scam Resistant", tone: "safe-strong" };
}

export function getExplainability(components) {
  const entries = Object.entries(components).map(([key, data]) => ({ key, ...data }));
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 2);
  const weaknesses = sorted.slice(-2).reverse();
  return { strengths, weaknesses };
}

export function scoreAssessmentResponses(responses) {
  const categoryDeltas = {};
  responses.forEach((r) => {
    categoryDeltas[r.category] = (categoryDeltas[r.category] || 0) + r.delta;
  });
  const categories = ["awareness", "digitalBehaviour", "paymentSafety", "responseReadiness"];
  const breakdown = {};
  categories.forEach((c) => {
    const answered = responses.filter((r) => r.category === c).length;
    breakdown[c] = {
      value: Math.max(0, Math.min(100, ASSESSMENT_BASELINE + (categoryDeltas[c] || 0))),
      basis: answered
        ? `Derived from ${answered} Safety Check scenario response${answered > 1 ? "s" : ""}`
        : "No scenarios in this category yet",
    };
  });
  breakdown.simulationPerformance = {
    value: ASSESSMENT_BASELINE,
    basis: "Neutral starting point — earned through Simulation Lab activity",
  };
  return breakdown;
}

export function makeScoreEvent(category, delta, reason) {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category,
    delta,
    reason,
    timestamp: new Date().toISOString(),
  };
}

export function computeSimulationScoreDeltas(passed, attemptIndex) {
  if (!passed) return attemptIndex === 0 ? { simulationPerformance: SIMULATION_FIRST_FAIL_PENALTY } : {};
  const factor = SIMULATION_PASS_SCHEDULE[Math.min(attemptIndex, SIMULATION_PASS_SCHEDULE.length - 1)];
  if (factor === 0) return {};
  const deltas = {};
  const baseGains = { simulationPerformance: 6, awareness: 3, responseReadiness: 2 };
  Object.entries(baseGains).forEach(([key, base]) => {
    const val = Math.round(base * factor);
    if (val > 0) deltas[key] = val;
  });
  return deltas;
}

export function computeResistanceScore(outcome, pressure) {
  if (outcome === "failed") return Math.max(0, 10 - Math.round(pressure / 20));
  return Math.max(0, 100 - pressure);
}

export function computeRiskScore(matchedSignals) {
  const sorted = [...matchedSignals].sort((a, b) => b.weight - a.weight);
  const total = sorted.reduce((sum, s, i) => sum + s.weight * (OVERLAP_DAMPENING[i] ?? 0.25), 0);
  return Math.round(Math.min(100, total));
}

export function getRiskBand(score) {
  return RISK_BANDS.find((b) => score <= b.max) || RISK_BANDS[RISK_BANDS.length - 1];
}

export function classifyScamType(matchedKeys) {
  const has = (k) => matchedKeys.includes(k);
  if (has("authority_impersonation") && (has("threat") || has("isolation_instruction"))) return "Digital Arrest / Government Impersonation";
  if (has("upi_pin_request") || (has("financial_request") && has("suspicious_link"))) return "UPI / Payment Fraud";
  if (has("remote_access_request")) return "Remote Access Scam";
  if (has("guaranteed_returns")) return "Investment Scam";
  if (has("otp_request")) return "OTP Phishing";
  if (has("credential_request") || has("suspicious_link")) return "Phishing / Credential Theft";
  if (has("financial_request")) return "Payment / Advance-Fee Scam";
  if (has("urgency")) return "Generic Urgency Scam";
  return "No specific pattern matched";
}

export function mapScamTypeToReportOption(scamType) {
  const map = {
    "Digital Arrest / Government Impersonation": "Digital Arrest / Fake Police Call",
    "UPI / Payment Fraud": "UPI / Payment Fraud",
    "Suspicious Link / Phishing": "Other",
    "Remote Access Scam": "Other",
    "Investment Scam": "Investment Scam",
    "OTP Phishing": "UPI / Payment Fraud",
    "Phishing / Credential Theft": "Other",
    "Payment / Advance-Fee Scam": "Other",
    "Generic Urgency Scam": "Other",
  };
  return map[scamType] || "Other";
}

export function extractEntities(text) {
  const phones = [...new Set((text.match(/\b[6-9]\d{9}\b/g) || []))];
  const amounts = [...new Set((text.match(/₹\s?[\d,]+|\brs\.?\s?[\d,]+/gi) || []))];
  const urls = [...new Set((text.match(/https?:\/\/\S+|www\.\S+/gi) || []))];
  return { phones, amounts, urls };
}

export function runScamAnalysis(text) {
  if (!text || !text.trim()) {
    return {
      riskScore: 0, riskLevel: "empty", riskLabel: "No content", tone: "info",
      verdictText: "Nothing to analyse yet", scamType: null, confidence: 0,
      detectedSignals: [], explanation: "", recommendedActions: [], entities: { phones: [], amounts: [], urls: [] },
      urgencyLevel: "none",
    };
  }
  const matched = SIGNAL_RULES.filter((s) => s.test.test(text));
  const riskScore = computeRiskScore(matched);
  const band = getRiskBand(riskScore);
  const scamType = matched.length ? classifyScamType(matched.map((m) => m.key)) : "No specific pattern matched";
  const confidence = matched.length ? Math.min(95, 35 + matched.length * 11) : 5;
  const urgencyLevel = matched.some((m) => m.key === "isolation_instruction") ? "high"
    : matched.some((m) => m.key === "urgency") ? "medium" : "low";

  const explanation = matched.length
    ? `This message shows ${matched.length} indicator${matched.length > 1 ? "s" : ""} commonly seen in scams: ${matched.map((m) => SIGNAL_EXPLANATIONS[m.key]).join("; ")}.`
    : "No known scam patterns were detected in this text, but the absence of a match is not a guarantee of safety — stay cautious with any unsolicited request for money, OTPs, or personal details.";

  const contextualActions = [];
  if (matched.some((m) => m.key === "upi_pin_request")) contextualActions.push("Never enter your UPI PIN to 'receive' money — it is only ever needed to send it.");
  if (matched.some((m) => m.key === "remote_access_request")) contextualActions.push("Uninstall any remote-access app immediately if you already installed one.");
  if (matched.some((m) => m.key === "guaranteed_returns")) contextualActions.push("Verify any investment platform's SEBI registration before depositing anything.");

  return {
    riskScore, riskLevel: band.level, riskLabel: band.label, tone: band.tone, verdictText: band.verdictText,
    scamType, confidence, detectedSignals: matched.map((m) => ({ key: m.key, label: m.label })),
    explanation, recommendedActions: [...RECOMMENDED_ACTIONS_BASE, ...contextualActions],
    entities: extractEntities(text), urgencyLevel,
  };
}

export const SUSPICIOUS_TLDS = /\.(xyz|top|click|zip|mov|country|gq|tk|cf|work|rest|fit)$/i;
export const BRAND_LOOKALIKE_WORDS = /(secure|verify|update|login|account|kyc|refund|helpdesk)/i;

export const URL_FLAG_RULES = [
  { key: "ip_address_url", label: "URL is a raw IP address, not a domain name", weight: 30, test: (host) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host) },
  { key: "no_https", label: "Not using HTTPS", weight: 10, test: (_h, url) => !/^https:/i.test(url) },
  { key: "suspicious_tld", label: "Uses a TLD frequently abused for scam sites", weight: 18, test: (host) => SUSPICIOUS_TLDS.test(host) },
  { key: "many_hyphens", label: "Unusually many hyphens in the domain", weight: 12, test: (host) => (host.match(/-/g) || []).length >= 3 },
  { key: "excess_subdomains", label: "Excess subdomains — often used to disguise the real domain", weight: 16, test: (host) => host.split(".").length > 3 },
  { key: "brand_lookalike", label: "Uses trust-signalling words ('secure', 'verify', 'kyc') outside an official domain", weight: 20, test: (host) => BRAND_LOOKALIKE_WORDS.test(host) && !/\.(gov\.in|nic\.in)$/i.test(host) },
  { key: "long_domain", label: "Unusually long domain name", weight: 10, test: (host) => host.length > 35 },
];

export function analyzeUrlHeuristics(url) {
  if (!url || !url.trim()) return null;
  let host = "";
  try { host = new URL(/^https?:\/\//i.test(url) ? url : `http://${url}`).hostname; } catch { host = url; }

  const matched = URL_FLAG_RULES.filter((f) => f.test(host, url));
  const riskScore = computeRiskScore(matched);
  const band = getRiskBand(riskScore);
  const explanation = matched.length
    ? `This URL's structure shows ${matched.length} pattern${matched.length > 1 ? "s" : ""} commonly associated with scam or phishing links: ${matched.map((m) => m.label.toLowerCase()).join("; ")}.`
    : "No local structural red flags were found in this URL, but that does not confirm it is safe — always reach sensitive sites by typing the official address directly rather than following a link.";

  return {
    riskScore, riskLevel: band.level, riskLabel: band.label, tone: band.tone, verdictText: band.verdictText,
    scamType: matched.length ? "Suspicious Link / Phishing" : "No specific pattern matched",
    confidence: matched.length ? Math.min(90, 30 + matched.length * 15) : 5,
    detectedSignals: matched.map((m) => ({ key: m.key, label: m.label })),
    explanation,
    recommendedActions: [...RECOMMENDED_ACTIONS_BASE, "Do not click or open this link.", "Type the official website address directly instead of following this link."],
    entities: { urls: [url], phones: [], amounts: [] },
    urgencyLevel: "n/a",
    host,
    localHeuristicOnly: true,
  };
}

export const DEMO_EXTRACTION_SAMPLES = [
  "Dear customer, your account KYC is pending. Update immediately within 24 hours or your account will be permanently blocked. Click here to verify: bit.ly/kyc-verify-now",
  "CBI ALERT: A parcel addressed to you containing illegal items was seized at customs. Join the video call immediately and do not disconnect until verification is complete.",
  "Congratulations! You have won ₹50,000 cashback. Scan this QR code and enter your UPI PIN to receive the reward before it expires.",
];

export function getDemoExtraction(seedIndex) {
  return DEMO_EXTRACTION_SAMPLES[seedIndex % DEMO_EXTRACTION_SAMPLES.length];
}

export const COACH_KNOWLEDGE_BASE = [
  { match: /digital arrest/i, answer: "A 'digital arrest' is not a real legal power — Indian police and courts can never arrest, detain, or hold trial over a video call. If anyone claims this, hang up and verify by calling the agency's official number yourself." },
  { match: /otp/i, answer: "Never share an OTP with anyone, including someone claiming to be from your bank, RBI, or police. No legitimate institution will ever ask for it over call, SMS reply, or WhatsApp." },
  { match: /upi|qr code/i, answer: "Scanning a QR code or entering your UPI PIN is only needed to SEND money, never to receive it. If someone asks you to scan a code or enter your PIN to 'get a refund', it is a scam." },
  { match: /kyc/i, answer: "Banks do not update KYC over a phone call or via links in SMS/WhatsApp. Visit your branch or the bank's official app/website directly if you're unsure." },
  { match: /report|complain/i, answer: "Report immediately at cybercrime.gov.in or call the national cyber helpline 1930. The first hour after a fraudulent transaction is critical for freezing the money." },
  { match: /remote access|screen shar|anydesk|teamviewer/i, answer: "Never install a screen-sharing or remote-access app for someone who called or messaged you first, even if they claim to be tech support. This gives them full view of your banking apps and OTPs." },
  { match: /investment|guaranteed return/i, answer: "Any platform promising guaranteed high returns is a red flag — SEBI-registered investments can never assure fixed profits. Verify registration before depositing anything." },
];

export function getCoachResponse(query) {
  const hit = COACH_KNOWLEDGE_BASE.find((k) => k.match.test(query));
  if (hit) return hit.answer;
  return "I don't have a specific answer for that yet in this local database. If this is an actual situation, do not send any money or OTPs, and consider reporting it to 1930 / cybercrime.gov.in.";
}
