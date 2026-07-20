import { ollamaService } from "./ollama";

// List of common demo scenarios (in English and Hindi) for deterministic mode
export const DEMO_SCENARIOS = {
  cbi: {
    match: ["cbi", "arrest", "police", "officer", "jail", "court", "warrant", "arrest me", "narcotics", "customs", "पुलिस", "सीबीआई", "गिरफ्तार", "अरेस्ट"],
    en: `🚨 **DO NOT TRANSFER MONEY BASED SOLELY ON THIS CALL.**

This is a scam. Disengage immediately.
1. **Hang up the call** and block the sender. Real police, CBI, TRAI, or customs officials NEVER conduct investigations or trials over video calls (like WhatsApp or Skype) and NEVER request money transfers to "verify" accounts.
2. **Do not share any personal details**, OTP codes, or passwords.
3. **Contact a trusted person** from your Safety Circle to help verify.
4. **Call the National Cyber Crime Helpline at 1930** or report on cybercrime.gov.in.`,
    hi: `🚨 **केवल इस कॉल के आधार पर पैसे ट्रांसफर न करें।**

यह एक घोटाला है। बातचीत तुरंत बंद करें।
1. **कॉल तुरंत काट दें** और नंबर ब्लॉक करें। असली पुलिस, सीबीआई, ट्राई (TRAI) या सीमा शुल्क (customs) विभाग के अधिकारी कभी भी वीडियो कॉल (व्हाट्सएप या स्काइप) पर पूछताछ नहीं करते हैं और न ही खातों को सत्यापित करने के लिए पैसे ट्रांसफर करने को कहते हैं।
2. **अपनी कोई भी निजी जानकारी**, ओटीपी कोड या बैंकिंग पासवर्ड साझा न करें।
3. **अपने परिवार के किसी भरोसेमंद व्यक्ति से संपर्क करें** ताकि वे सत्यापित करने में मदद कर सकें।
4. **राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर कॉल करें** या cybercrime.gov.in पर शिकायत दर्ज करें।`
  },
  upi: {
    match: ["upi pin", "qr code", "receive money", "claim refund", "refund", "receving money", "यूपीआई पिन", "क्यूआर कोड", "पैसे प्राप्त", "रिफंड"],
    en: `❌ **CRITICAL RULE: UPI PIN entry always SENDS money.**

You **never** need to enter your UPI PIN or scan a QR code to RECEIVE money.
1. **Never scan any QR code** sent by a buyer or stranger claiming they are paying you.
2. If an app prompts you to enter your UPI PIN, it is a **debit (deduction) action** and money will leave your account.
3. If someone tells you to enter numbers to "receive a refund", hang up immediately.`,
    hi: `❌ **महत्वपूर्ण नियम: यूपीआई पिन (UPI PIN) दर्ज करने का मतलब हमेशा पैसे भेजना होता है।**

आपको पैसे प्राप्त (RECEIVE) करने के लिए कभी भी अपना यूपीआई पिन दर्ज करने या क्यूआर कोड स्कैन करने की आवश्यकता **नहीं** होती है।
1. **कभी भी किसी खरीदार या अजनबी द्वारा भेजे गए क्यूआर कोड को स्कैन न करें** जो दावा कर रहा हो कि वह आपको भुगतान कर रहा है।
2. यदि कोई ऐप आपसे यूपीआई पिन दर्ज करने को कहता है, तो यह आपके खाते से **पैसे काटने की प्रक्रिया** है।
3. यदि कोई आपको रिफंड प्राप्त करने के लिए पिन डालने को कहे, तो बातचीत तुरंत बंद कर दें।`
  },
  screenshare: {
    match: ["screen-sharing", "anydesk", "teamviewer", "rustdesk", "install app", "download app", "zoom", "स्क्रीन शेयर", "एनीडेस्क", "ऐप डाउनलोड"],
    en: `⚠️ **IMMEDIATE ACTION REQUIRED: Block remote access.**

If you installed Anydesk, TeamViewer, RustDesk, or any screen-sharing tool at a caller's request:
1. **Turn off your internet/WiFi immediately** to sever their connection.
2. **Uninstall the app** from your device immediately.
3. **Contact your bank immediately** to block your debit/credit cards and netbanking.
4. Check for unauthorized transactions and report them immediately to **1930** or bank support.`,
    hi: `⚠️ **तुरंत कार्रवाई की आवश्यकता है: रिमोट एक्सेस को ब्लॉक करें।**

यदि आपने किसी कॉलर के कहने पर एनीडेस्क (AnyDesk), टीमव्यूअर (TeamViewer), रस्टडेस्क (RustDesk) या कोई स्क्रीन-शेयरिंग ऐप इंस्टॉल किया है:
1. **तुरंत अपना इंटरनेट/वाईफाई बंद करें** ताकि उनका रिमोट कनेक्शन कट जाए।
2. फोन से उस **ऐप को तुरंत अनइंस्टॉल (डिलीट)** करें।
3. **अपने बैंक को तुरंत सूचित करें** ताकि वे आपके कार्ड और इंटरनेट बैंकिंग को ब्लॉक कर सकें।
4. किसी भी अनधिकृत लेनदेन की जांच करें और तुरंत **1930** हेल्पलाइन या बैंक को रिपोर्ट करें।`
  },
  investment: {
    match: ["investment", "whatsapp group", "telegram group", "daily profit", "guaranteed return", "part-time job", "youtube like", "earn money", "निवेश", "व्हाट्सएप ग्रुप", "मुनाफा", "पार्ट टाइम"],
    en: `📈 **INVESTMENT RED FLAGS: Guaranteed high returns are fake.**

Messages promising high profits from crypto/stock tips or WhatsApp investment groups are massive scams.
1. **Do not send any money** as registration fee, deposit, or portfolio funding.
2. Do not trust screenshots of "profits" posted by other group members — they are all operated by the same scammers.
3. Legit stock tips are never run anonymously via Telegram or WhatsApp. Verify if they are SEBI registered.`,
    hi: `📈 **निवेश के खतरे: गारंटीड अधिक मुनाफा हमेशा फर्जी होता है।**

व्हाट्सएप या टेलीग्राम ग्रुपों के माध्यम से क्रिप्टो या स्टॉक मार्केट में भारी मुनाफे या वीडियो लाइक करने के पार्ट-टाइम जॉब के वादे बड़े धोखे हैं।
1. **पंजीकरण शुल्क, जमा राशि या पोर्टफोलियो के नाम पर कोई पैसा न भेजें।**
2. ग्रुप के अन्य सदस्यों द्वारा साझा किए गए "मुनाफे" के स्क्रीनशॉट पर भरोसा न करें — वे सब फर्जी और नकली हैं।
3. वैध स्टॉक निवेश सलाह कभी भी व्हाट्सएप/टेलीग्राम पर गुप्त रूप से नहीं दी जाती।`
  }
};

export const AIProvider = {
  // Strict Safety system prompt for real LLM integration
  getSystemPrompt(language) {
    return `You are ScamShield AI Coach, a highly specialized cybersecurity assistant helping Indian citizens protect themselves from digital fraud.
Current Language Mode: ${language}. Always reply in ${language}. If language is Hindi, use natural, conversational, polite Hindi (e.g. using "आप", natural vocabulary) rather than awkward literal translation.

CRITICAL INSTRUCTIONS:
1. URGENT SAFETY OVERRIDE: If the user indicates an active urgent threat (e.g., they are currently on a video call with police,Trai, custom officer, or someone is demanding money transfer, or they installed a screen share app), you MUST IMMEDIATELY start your response with: "Do not transfer money based solely on this call" (or Hindi equivalent). Tell them to disengage immediately.
2. NEVER ask the user to share their password, OTP, UPI PIN, bank details, or credit cards.
3. Recommend safe next actions: End communications, contact trusted family member, verify independently, call Cyber helpline 1930.
4. Keep messages structured with bullet points. Be direct, clear, and calm. Do not waste time on warm filler words in urgent situations.`;
  },

  // Main method to fetch response
  async getCoachResponse(history, query, language = "English", context = null, host = "/api/ollama", model = "llama3") {
    const isHindi = (language || "").toLowerCase() === "hindi";
    const lowerQuery = query.toLowerCase();

    // 1. Core Safety Override Classifier (Deterministic for speed and high availability)
    let matchedScenario = null;
    
    // Check CBI/Arrest/Urgent demands
    if (DEMO_SCENARIOS.cbi.match.some(keyword => lowerQuery.includes(keyword)) && (lowerQuery.includes("transfer") || lowerQuery.includes("money") || lowerQuery.includes("lakh") || lowerQuery.includes("video") || lowerQuery.includes("call") || lowerQuery.includes("arrest") || lowerQuery.includes("police"))) {
      matchedScenario = "cbi";
    } else if (DEMO_SCENARIOS.upi.match.some(keyword => lowerQuery.includes(keyword))) {
      matchedScenario = "upi";
    } else if (DEMO_SCENARIOS.screenshare.match.some(keyword => lowerQuery.includes(keyword))) {
      matchedScenario = "screenshare";
    } else if (DEMO_SCENARIOS.investment.match.some(keyword => lowerQuery.includes(keyword))) {
      matchedScenario = "investment";
    } else if (DEMO_SCENARIOS.cbi.match.some(keyword => lowerQuery.includes(keyword))) {
      matchedScenario = "cbi"; // general fallback to authority threats
    }

    // If an urgent match is found, immediately prioritize safety warning
    if (matchedScenario) {
      const response = isHindi ? DEMO_SCENARIOS[matchedScenario].hi : DEMO_SCENARIOS[matchedScenario].en;
      return {
        text: response,
        isUrgentOverride: true,
        source: "local-safety-rules"
      };
    }

    // 2. Structured Scan Context Handler
    if (context) {
      const orgName = context.scamType || "an unknown source";
      const riskScore = context.riskScore || 0;
      const explanationText = context.explanation || "";

      let contextResponse = "";
      if (isHindi) {
        contextResponse = `🔍 **स्कैनर रिपोर्ट विश्लेषण (जोखिम स्कोर: ${riskScore}/100)**

यह संचार संदिग्ध है क्योंकि इसमें **${orgName}** के नाम का उपयोग किया गया है।
धोखेबाज डर और जल्दबाजी का माहौल बनाने के लिए ऐसे हथकंडे अपनाते हैं ताकि आप बिना सोचे-समझे पैसे या जानकारी साझा कर दें।

**सुरक्षा नियम:**
- **पैसे ट्रांसफर न करें**: किसी के कहने पर बैंक खाता सत्यापित करने के लिए कोई भुगतान न करें।
- **विवरण गुप्त रखें**: कभी भी ओटीपी या यूपीआई पिन साझा न करें।
- **सत्यापन करें**: अपने सेफ्टी सर्कल के किसी सदस्य से इस बारे में बात करें। किसी भी शिकायत के लिए 1930 डायल करें।

${explanationText ? `\n*स्कैनर का अतिरिक्त विवरण: ${explanationText}*` : ""}`;
      } else {
        contextResponse = `🔍 **Scanner Context Analysis (Risk Score: ${riskScore}/100)**

This communication is flagged as high-risk because it claims to be from **${orgName}**. 
Scammers impersonate official entities to create panic, hoping you'll react before checking.

**Immediate Safety Actions:**
- **Do not transfer any money**: Legitimate organizations never request account deposits or verification fees.
- **Do not share credentials**: Never input your UPI PIN or read out SMS OTPs.
- **Verify independently**: Talk to someone in your Safety Circle and report any active threat to the Cyber Police at 1930.

${explanationText ? `\n*Scanner details: ${explanationText}*` : ""}`;
      }

      return {
        text: contextResponse,
        isUrgentOverride: false,
        source: "structured-context-engine"
      };
    }

    // 3. Dispatch to Ollama if connected and online
    let ollamaOnline = false;
    try {
      const models = await ollamaService.fetchModels(host);
      ollamaOnline = models.length > 0;
    } catch (_) {}

    if (ollamaOnline) {
      try {
        const sysPrompt = this.getSystemPrompt(language);
        // We override history to prepend system instruction
        const aiResponse = await ollamaService.chatWithCoach(history, query, language, host, model);
        return {
          text: aiResponse,
          isUrgentOverride: false,
          source: "ollama-llm"
        };
      } catch (err) {
        console.warn("Ollama query failed. Falling back to deterministic demo response.", err);
      }
    }

    // 4. Default Scenario Handlers / Generic Fallback
    const fallbackText = isHindi 
      ? `🤖 **स्कैम कोच (डेमो मोड):**\n\nमैं आपकी सुरक्षा के लिए यहां हूं। कृपया अपना प्रश्न अधिक स्पष्ट रूप से पूछें। \n\n**याद रखें:**\n- कभी भी ओटीपी (OTP) या यूपीआई पिन किसी से साझा न करें।\n- पुलिस या बैंक अधिकारी कभी भी पैसे ट्रांसफर करने की मांग नहीं करते।\n- मदद के लिए हेल्पलाइन 1930 पर कॉल करें।`
      : `🤖 **Scam Coach (Demo Mode):**\n\nI'm here to help keep you safe. Please describe your situation or ask a specific question.\n\n**Always remember:**\n- Never share OTP codes or banking PINs.\n- Police and bank officials will never demand money transfers over video calls.\n- Call 1930 immediately to report active fraud.`;

    return {
      text: fallbackText,
      isUrgentOverride: false,
      source: "demo-fallback"
    };
  }
};
