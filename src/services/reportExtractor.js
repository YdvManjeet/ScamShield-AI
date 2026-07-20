// Utility helper to extract indicators from community reports description

export const reportExtractor = {
  extractScamData(text) {
    if (!text || !text.trim()) {
      return null;
    }

    const lower = text.toLowerCase();

    // 1. Extract phone numbers
    const phoneMatches = text.match(/\b\d{10,12}\b/g) || [];
    const phones = [...new Set(phoneMatches)];

    // 2. Extract UPI IDs
    const upiMatches = text.match(/\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g) || [];
    const upis = [...new Set(upiMatches)];

    // 3. Extract domains/links
    const urlMatches = text.match(/\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}\b/g) || [];
    // filter common words that match the regex by mistake
    const commonDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com"];
    const domains = [...new Set(urlMatches)].filter(d => !commonDomains.includes(d.toLowerCase()));

    // 4. Extract likely scam type
    let scamType = "Other / Unclassified Fraud";
    if (lower.includes("cbi") || lower.includes("arrest") || lower.includes("police") || lower.includes("court") || lower.includes("custody")) {
      scamType = "Digital Arrest / Government Impersonation";
    } else if (lower.includes("qr code") || lower.includes("refund") || lower.includes("pin")) {
      scamType = "UPI Refund / QR Code Scam";
    } else if (lower.includes("fedex") || lower.includes("dhl") || lower.includes("customs") || lower.includes("parcel") || lower.includes("courier")) {
      scamType = "FedEx / Courier parcel scam";
    } else if (lower.includes("kyc") || lower.includes("sim") || lower.includes("block") || lower.includes("verification")) {
      scamType = "Bank KYC / Sim card blocking scam";
    } else if (lower.includes("investment") || lower.includes("return") || lower.includes("profit") || lower.includes("crypto") || lower.includes("sebi")) {
      scamType = "Fake Investment WhatsApp Group";
    }

    // 5. Extract claimed authority
    let claimedAuthority = "Unknown entity";
    if (lower.includes("cbi")) claimedAuthority = "Central Bureau of Investigation (CBI)";
    else if (lower.includes("police")) claimedAuthority = "State Police / Cyber Cell";
    else if (lower.includes("customs") || lower.includes("dhl") || lower.includes("fedex")) claimedAuthority = "FedEx / Customs Clearance";
    else if (lower.includes("sbi") || lower.includes("bank") || lower.includes("hdfc") || lower.includes("icici")) claimedAuthority = "Bank Customer Support";
    else if (lower.includes("electricity") || lower.includes("power") || lower.includes("bill")) claimedAuthority = "State Electricity Board";
    else if (lower.includes("trai") || lower.includes("telecom")) claimedAuthority = "Telecom Regulatory Authority (TRAI)";

    // 6. Extract urgency indicators
    let urgencyLanguage = "Normal / Low pressure";
    if (lower.includes("arrest warrant") || lower.includes("jail") || lower.includes("court")) {
      urgencyLanguage = "Arrest / Legal prosecution threats";
    } else if (lower.includes("immediate") || lower.includes("urgent") || lower.includes("within 1 hour") || lower.includes("within 2 hours") || lower.includes("now")) {
      urgencyLanguage = "Urgent action demanded (immediate penalty)";
    } else if (lower.includes("secret") || lower.includes("don't tell") || lower.includes("do not call anyone")) {
      urgencyLanguage = "Isolation / Secrecy demanded";
    }

    // 7. Extract payment method
    let paymentMethod = "Not specified";
    if (lower.includes("upi") || lower.includes("gpay") || lower.includes("phonepe") || lower.includes("paytm")) {
      paymentMethod = "Unified Payments Interface (UPI)";
    } else if (lower.includes("bank transfer") || lower.includes("rbi account") || lower.includes("transfer") || lower.includes("deposit")) {
      paymentMethod = "Direct Bank Account Transfer (IMPS/NEFT)";
    } else if (lower.includes("gift card") || lower.includes("voucher")) {
      paymentMethod = "Gift Card / Voucher purchase";
    }

    return {
      scamType,
      claimedAuthority,
      urgencyLanguage,
      paymentMethod,
      phones: phones.slice(0, 3),
      upis: upis.slice(0, 3),
      domains: domains.slice(0, 3)
    };
  }
};
