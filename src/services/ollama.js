// Service to interface with local Ollama instance
// Bypasses CORS via Vite proxy (/api/ollama) or calls a direct endpoint if configured

const DEFAULT_HOST = "/api/ollama";
const LOCAL_FALLBACK_HOST = "http://localhost:11434";

function getHostUrl(customHost) {
  if (customHost && customHost.trim()) {
    return customHost.trim().replace(/\/$/, "");
  }
  return DEFAULT_HOST;
}

export const ollamaService = {
  // Test connection and fetch available models
  async fetchModels(customHost) {
    const host = getHostUrl(customHost);
    try {
      const response = await fetch(`${host}/api/tags`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch models from Ollama");
      const data = await response.json();
      return data.models || [];
    } catch (err) {
      // If default proxy fails, try local fallback host directly in case user enabled CORS
      if (host === DEFAULT_HOST) {
        try {
          const directResponse = await fetch(`${LOCAL_FALLBACK_HOST}/api/tags`);
          if (directResponse.ok) {
            const data = await directResponse.json();
            return data.models || [];
          }
        } catch (_) {}
      }
      console.warn("Ollama connection failed:", err);
      throw err;
    }
  },

  // Deep Scan Scam Analysis
  async analyzeScam(text, customHost, model) {
    const host = getHostUrl(customHost);
    const systemPrompt = `You are ScamShield AI, an expert cybersecurity analyst specializing in Indian digital scams (Digital Arrest, UPI QR scams, FedEx courier fraud, bank KYC blocking, electricity bill fraud, fake work-from-home jobs, AI voice cloning).
Analyze the text provided by the user for scam indicators. You must return your analysis as a valid JSON object.

Format instructions:
Return a JSON object with the following fields:
{
  "riskScore": number (0 to 100, where 0 is completely safe and 100 is critical risk),
  "riskLevel": "low" | "caution" | "suspicious" | "high" | "critical",
  "riskLabel": "Low Risk" | "Caution" | "Suspicious" | "High Risk" | "Critical Risk",
  "scamType": string (e.g. "Digital Arrest / Government Impersonation", "UPI / Payment Fraud", "Courier / Parcel Scam", "Fake Bank KYC", "Investment Scam", etc.),
  "confidence": number (0 to 100, representing your percentage confidence),
  "detectedSignals": Array of strings (the triggers found, e.g. ["Authority Impersonation", "Threat of Arrest", "Urgency", "Payment Request"]),
  "explanation": string (A concise 2-3 sentence explanation of why this is a scam, specifying the exact psychological tricks used, like fear, authority, or isolation, in plain English),
  "recommendedActions": Array of strings (3-5 concrete steps the user should take right now),
  "urgencyLevel": "low" | "medium" | "high"
}

Do not include any markup, markdown wrappers (like \`\`\`json), or conversational text outside the JSON. Just output the raw JSON object.`;

    try {
      const response = await fetch(`${host}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          prompt: `Text to analyze:\n"${text}"`,
          system: systemPrompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.1,
          }
        }),
      });

      if (!response.ok) throw new Error("Ollama generation failed");
      const data = await response.json();
      return JSON.parse(data.response);
    } catch (err) {
      console.error("Ollama scam analysis failed, trying fallback:", err);
      throw err;
    }
  },

  // Scam Coach Chat
  async chatWithCoach(history, message, userLanguage = "English", customHost, model) {
    const host = getHostUrl(customHost);
    
    // Format history into Ollama chat format
    const messages = [
      {
        role: "system",
        content: `You are the ScamShield AI Coach, a friendly, patient, and highly knowledgeable Indian cybersecurity specialist.
Your goal is to answer questions about scams, digital safety, UPI, bank transfers, mobile security, and cybersecurity reporting (such as 1930 and cybercrime.gov.in).
Respond in clear, simple terms. Since you are speaking to everyday citizens (including senior citizens or digital beginners), avoid overly technical jargon.
Always advise caution, never advise sending money or OTPs, and always suggest verifying claims through official phone numbers or visits.
Current user language preference: ${userLanguage}. Please reply in ${userLanguage} if possible, or adapt your tone to be extremely accessible.`
      },
      ...history.map(m => ({
        role: m.from === "coach" ? "assistant" : "user",
        content: m.text
      })),
      { role: "user", content: message }
    ];

    try {
      const response = await fetch(`${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
          }
        }),
      });

      if (!response.ok) throw new Error("Ollama chat failed");
      const data = await response.json();
      return data.message.content;
    } catch (err) {
      console.error("Ollama coach chat failed:", err);
      throw err;
    }
  },

  // Live Scammer Simulator Chat
  async chatWithScammer(history, personaId, customHost, model) {
    const host = getHostUrl(customHost);

    let personaSystemPrompt = "";
    if (personaId === "digital-arrest") {
      personaSystemPrompt = `You are simulating a scammer named Officer Arjun Mehta from the CBI / Cyber Cell.
The user is your target. You must stay in character at all times. Do not reveal you are an AI.
Your tactic: Impersonate high authority, speak with extreme severity. Tell the user their Aadhaar card was linked to a money-laundering case involving Jet Airways or illegal packages containing drugs.
You must order them to stay on the video/text call and NOT tell anyone (isolation).
If they hesitate, threaten them with immediate arrest, legal warrants, and freezing of all their bank accounts within 1 hour.
Eventually, demand they transfer a "refundable verification deposit" of Rs. 98,000 to an RBI-approved safe account.
Keep your messages relatively short (2-3 sentences max) to simulate a real chat app. Be pushy, demanding, and urgent.`;
    } else if (personaId === "upi-refund") {
      personaSystemPrompt = `You are simulating a scammer posing as an innocent online buyer who "accidentally" sent extra money to the user.
The user is your target. Stay in character.
Your tactic: Play the victim. Say you wanted to send Rs. 500 for a product/service, but accidentally transferred Rs. 5,000. Cry or sound desperate, saying you need it for rent or medicine urgently.
Ask the user to scan a QR code you'll send or open a UPI link, and enter their UPI PIN to "receive" the refund.
If they refuse, claim that this is the only technical way to reverse the payment and accuse them of stealing your money.
Keep messages short and frantic.`;
    } else if (personaId === "courier") {
      personaSystemPrompt = `You are simulating a scammer posing as a FedEx/DHL customs clearance executive.
Your tactic: Tell the user a parcel sent from Mumbai to Taiwan containing 5 passport booklets, 3 credit cards, and 200g of MDMA (drugs) under their Aadhaar name has been intercepted.
You must sound professional but urgent. Tell them their identity is compromised and they must be connected to the "Cyber Crime Department" immediately.
Maintain the threat and pressure. Demand their Aadhaar number to verify, and tell them to stay online.`;
    } else {
      personaSystemPrompt = `You are simulating a generic online scammer trying to steal money, OTPs, or credentials from the user. Play your role convincingly. Stay in character, do not reveal you are an AI. Demand urgent action or payment.`;
    }

    const messages = [
      { role: "system", content: personaSystemPrompt },
      ...history.map(m => ({
        role: m.from === "scammer" ? "assistant" : "user",
        content: m.text
      }))
    ];

    try {
      const response = await fetch(`${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.8,
            stop: ["User:", "Target:"]
          }
        }),
      });

      if (!response.ok) throw new Error("Ollama scammer simulation failed");
      const data = await response.json();
      return data.message.content;
    } catch (err) {
      console.error("Ollama scammer simulation failed:", err);
      throw err;
    }
  },

  // Evaluate the simulation transcript
  async evaluateSimulation(history, personaId, customHost, model) {
    const host = getHostUrl(customHost);
    
    const transcript = history.map(m => `${m.from === "scammer" ? "Scammer" : "User"}: ${m.text}`).join("\n");
    const systemPrompt = `You are a Cybersecurity Safety Evaluator. Analyze the chat transcript of a simulated scam interaction between a User and a Scammer.
You must assess the user's performance and output a JSON report.

Assess:
- Did the user fall for the scam? (e.g. did they agree to transfer money, share credentials/OTP, install apps, or provide sensitive details?)
- Did the user identify the red flags?
- How much pressure did they accumulate before exiting or failing?
- What did they do right or wrong?

Format instructions:
Return a JSON object with the following fields:
{
  "passed": boolean (true if they resisted the scam and ended the call or refused demands; false if they complied with critical threats/demands),
  "score": number (0 to 100, where 100 is a perfect score showing immediate detection and exit),
  "pressureAccumulated": number (0 to 100, based on how long they stayed on the line engaging with the scammer),
  "strengths": Array of strings (what they did well, e.g. ["Refused to share OTP", "Ended the call when payment was demanded"]),
  "weaknesses": Array of strings (what they could improve, e.g. ["Engaged too long", "Provided Aadhaar number"]),
  "debriefText": string (A concise 3-4 sentence evaluation detailing exactly how they handled the scammer's specific tactic, explaining what they did well and how they should handle it in real life.)
}

Do not include any markup, markdown wrappers, or conversational text outside the JSON. Just output the raw JSON object.`;

    try {
      const response = await fetch(`${host}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          prompt: `Simulation Chat Transcript:\n"${transcript}"`,
          system: systemPrompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.1,
          }
        }),
      });

      if (!response.ok) throw new Error("Ollama simulation evaluation failed");
      const data = await response.json();
      return JSON.parse(data.response);
    } catch (err) {
      console.error("Ollama evaluation failed:", err);
      throw err;
    }
  }
};
