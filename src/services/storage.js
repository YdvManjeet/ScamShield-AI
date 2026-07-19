const STORAGE_KEYS = {
  onboarding: "ss:onboarding",     // { completed, profile, responses }
  scoreState: "ss:score-state",    // { breakdown, events, missions, simRepeats, scanRewardCount, rewardedScanKeys }
  scanHistory: "ss:scan-history",  // [{ id, inputType, riskScore, riskLevel, riskLabel, scamType, timestamp, inputSummary, result }]
  ollamaConfig: "ss:ollama-config", // { host, model }
};

const hasWindowStorage = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

async function repoLoad(key) {
  try {
    if (hasWindowStorage) {
      const result = await window.storage.get(key, false);
      return result ? JSON.parse(result.value) : null;
    } else {
      const result = window.localStorage.getItem(key);
      return result ? JSON.parse(result) : null;
    }
  } catch (err) {
    // Missing key throws or fails, return null
    return null;
  }
}

async function repoSave(key, value) {
  try {
    if (hasWindowStorage) {
      const result = await window.storage.set(key, JSON.stringify(value), false);
      return !!result;
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
  } catch (err) {
    console.error("ScamShield storage write failed:", err);
    return false;
  }
}

export const scoreRepository = {
  loadOnboarding: () => repoLoad(STORAGE_KEYS.onboarding),
  saveOnboarding: (data) => repoSave(STORAGE_KEYS.onboarding, data),
  loadScoreState: () => repoLoad(STORAGE_KEYS.scoreState),
  saveScoreState: (data) => repoSave(STORAGE_KEYS.scoreState, data),
  loadScanHistory: () => repoLoad(STORAGE_KEYS.scanHistory),
  saveScanHistory: (data) => repoSave(STORAGE_KEYS.scanHistory, data),
  loadOllamaConfig: () => repoLoad(STORAGE_KEYS.ollamaConfig),
  saveOllamaConfig: (data) => repoSave(STORAGE_KEYS.ollamaConfig, data),
};
