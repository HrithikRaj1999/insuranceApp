import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const allowPaid = process.env.ALLOW_AI_PAID === "true";
const useMockFlag = process.env.USE_MOCK_AI === "true";
const geminiEnabled = !useMockFlag && !!geminiApiKey;
const genAI = geminiEnabled ? new GoogleGenerativeAI(geminiApiKey) : null;
function warn(label: string, msg: string, extra?: Record<string, unknown>) {
  const base = `[AI:${label}] ${msg}`;
  if (extra) console.warn(base, extra);else console.warn(base);
}
function info(label: string, msg: string, extra?: Record<string, unknown>) {
  const base = `[AI:${label}] ${msg}`;
  if (extra) console.log(base, extra);else console.log(base);
}
function mockSummary(description: string, reason: string): string {
  warn("mock", `Using mock summary: ${reason}`);
  const d = description ?? "";
  const truncated = d.substring(0, 150);
  return `[Mock Summary] ${truncated}${d.length > 150 ? "..." : ""}`;
}
function normalizeCategory(s?: string | null): string {
  const v = (s || "").toLowerCase().trim();
  if (["auto", "property", "health", "life", "liability", "other"].includes(v)) return v;
  return "other";
}
function mockCategorize(description: string): string {
  const d = (description || "").toLowerCase();
  if (/\b(car|vehicle|accident|rear[- ]?end|bumper|fender|collision)\b/.test(d)) return "auto";
  if (/\b(water|flood|fire|smoke|roof|pipe|leak|storm|theft|burglary|home|house)\b/.test(d)) return "property";
  if (/\b(hospital|injur(?:y|ies)|doctor|medical|treatment|surgery)\b/.test(d)) return "health";
  if (/\b(life insurance|policyholder deceased|death|beneficiary)\b/.test(d)) return "life";
  if (/\b(liability|negligence|third[- ]?party|lawsuit|slip and fall)\b/.test(d)) return "liability";
  return "other";
}
function mockUrgency(description: string): "low" | "medium" | "high" {
  const d = (description || "").toLowerCase();
  if (/\b(injury|injuries|hospital|emergency|urgent|immediate|unsafe|gas leak|electrical fire)\b/.test(d)) return "high";
  if (/\b(flood|burst pipe|no power|roof leak|major damage|theft ongoing)\b/.test(d)) return "high";
  if (/\b(minor|cosmetic|scratch|small dent|no injuries|no rush)\b/.test(d)) return "low";
  return "medium";
}
async function callGeminiWithRetry(prompt: string, systemInstruction?: string, maxRetries: number = 3): Promise<string> {
  if (!geminiEnabled) throw new Error("geminiDisabled");
  if (!genAI) throw new Error("geminiClientNotConfigured");
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction || "You are a helpful AI assistant."
  });
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      info("trying", `Attempting Gemini call (${attempt}/${maxRetries})`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      if (!text) {
        warn("empty", `Gemini returned empty response on attempt ${attempt}/${maxRetries}`);
        if (attempt === maxRetries) {
          throw new Error("Gemini returned empty response after all retries");
        }
        continue;
      }
      info("success", ` Gemini succeeded on attempt ${attempt}!`);
      return text;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      warn("gemini-failed", `Gemini attempt ${attempt}/${maxRetries} failed: ${errorMsg}`);
      if (attempt === maxRetries) {
        throw new Error(`Gemini failed after ${maxRetries} attempts. Last error: ${errorMsg}`);
      }
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      info("delay", `Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("All Gemini attempts exhausted");
}
export async function generateSummary(description: string): Promise<string> {
  if (!description || description.trim().length === 0) {
    return "[Mock Summary] Empty description provided.";
  }
  if (!geminiEnabled) {
    const reason = useMockFlag ? "USE_MOCK_AI=true" : !geminiApiKey ? "GEMINI_API_KEY missing" : "Unknown gating";
    return mockSummary(description, reason);
  }
  try {
    info("start", "Starting Gemini summary generation...");
    const systemInstruction = "You are an insurance claim assistant. Summarize the following claim description in exactly 2 clear, concise sentences.";
    const result = await callGeminiWithRetry(description, systemInstruction);
    info("summary-success", "Generated summary using Gemini");
    return result;
  } catch (e: any) {
    warn("error", "Gemini failed — using mock", {
      error: e?.message || String(e)
    });
    return mockSummary(description, "Gemini API failed");
  }
}
export async function categorizeClaimType(description: string): Promise<string> {
  if (!geminiEnabled) {
    const reason = useMockFlag ? "USE_MOCK_AI=true" : !geminiApiKey ? "GEMINI_API_KEY missing" : "Unknown gating";
    warn("mock-cat", `Using mock categorization: ${reason}`);
    return mockCategorize(description);
  }
  try {
    info("start", "Starting Gemini categorization...");
    const systemInstruction = "Categorize this insurance claim into one of: auto, property, health, life, liability, other. Reply with only the category (one word).";
    const result = await callGeminiWithRetry(description, systemInstruction);
    const cat = normalizeCategory(result.split(/\s+/)[0]);
    if (cat === "other" && !result) {
      warn("empty-cat", "Empty category from Gemini, using mock");
      return mockCategorize(description);
    }
    info("cat-success", `Categorized as "${cat}" using Gemini`);
    return cat;
  } catch (e: any) {
    warn("error-cat", "Gemini failed — using mock", {
      error: e?.message || String(e)
    });
    return mockCategorize(description);
  }
}
export async function assessClaimUrgency(description: string): Promise<"low" | "medium" | "high"> {
  if (!geminiEnabled) {
    const reason = useMockFlag ? "USE_MOCK_AI=true" : !geminiApiKey ? "GEMINI_API_KEY missing" : "Unknown gating";
    warn("mock-urgency", `Using mock urgency: ${reason}`);
    return mockUrgency(description);
  }
  try {
    info("start", "Starting Gemini urgency assessment...");
    const systemInstruction = "Assess the urgency of this insurance claim. Consider injuries, property damage, and time-sensitivity. Reply with only one word: low, medium, or high.";
    const result = await callGeminiWithRetry(description, systemInstruction);
    const raw = (result || "").toLowerCase().trim();
    if (raw === "low" || raw === "medium" || raw === "high") {
      info("urgency-success", `Assessed as "${raw}" using Gemini`);
      return raw as "low" | "medium" | "high";
    }
    const first = raw.split(/\s+/)[0];
    if (first === "low" || first === "medium" || first === "high") {
      info("urgency-success", `Assessed as "${first}" using Gemini`);
      return first as "low" | "medium" | "high";
    }
    warn("unexpected-urgency", "Unexpected urgency output — using mock", {
      raw,
      model: "gemini-1.5-flash"
    });
    return mockUrgency(description);
  } catch (e: any) {
    warn("error-urgency", "Gemini failed — using mock", {
      error: e?.message || String(e)
    });
    return mockUrgency(description);
  }
}
export function getAIServiceStatus() {
  return {
    configuredKey: !!geminiApiKey,
    geminiEnabled,
    useMockFlag,
    provider: "google-gemini",
    model: "gemini-1.5-flash",
    effectiveMode: geminiEnabled ? "gemini-1.5-flash" : "free-mock"
  };
}
export function getAvailableModels() {
  return {
    primary: "gemini-1.5-flash",
    provider: "Google Gemini",
    tier: "free (with limits)"
  };
}