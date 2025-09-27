import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY || "";
const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || "100", 10);
const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || "0.3");
const allowPaid = process.env.ALLOW_OPENAI_PAID === "true";
const useMockFlag = process.env.USE_MOCK_AI === "true";
const paidEnabled = allowPaid && !useMockFlag && !!apiKey;
const openai = paidEnabled
  ? new OpenAI({
      apiKey,
    })
  : null;
function warn(label: string, msg: string, extra?: Record<string, unknown>) {
  const base = `[AI:${label}] ${msg}`;
  if (extra) console.warn(base, extra);
  else console.warn(base);
}
function mockSummary(description: string, reason: string): string {
  warn("mock", `Using mock summary: ${reason}`);
  const truncated = (description ?? "").substring(0, 150);
  return `[Mock Summary] ${truncated}${description ?? ""}`;
}
function normalizeCategory(s?: string | null): string {
  const v = (s || "").toLowerCase().trim();
  if (["auto", "property", "health", "life", "liability", "other"].includes(v)) return v;
  return "other";
}
function mockCategorize(description: string): string {
  const d = (description || "").toLowerCase();
  if (/\b(car|vehicle|accident|rear[- ]?end|bumper|fender|collision)\b/.test(d)) return "auto";
  if (/\b(water|flood|fire|smoke|roof|pipe|leak|storm|theft|burglary|home|house)\b/.test(d))
    return "property";
  if (/\b(hospital|injur(?:y|ies)|doctor|medical|treatment|surgery)\b/.test(d)) return "health";
  if (/\b(life insurance|policyholder deceased|death|beneficiary)\b/.test(d)) return "life";
  if (/\b(liability|negligence|third[- ]?party|lawsuit|slip and fall)\b/.test(d))
    return "liability";
  return "other";
}
function mockUrgency(description: string): "low" | "medium" | "high" {
  const d = (description || "").toLowerCase();
  if (
    /\b(injury|injuries|hospital|emergency|urgent|immediate|unsafe|gas leak|electrical fire)\b/.test(
      d
    )
  )
    return "high";
  if (/\b(flood|burst pipe|no power|roof leak|major damage|theft ongoing)\b/.test(d)) return "high";
  if (/\b(minor|cosmetic|scratch|small dent|no injuries|no rush)\b/.test(d)) return "low";
  return "medium";
}
export async function generateSummary(description: string): Promise<string> {
  if (!description || description.trim().length === 0) {
    return "[Mock Summary] Empty description provided.";
  }
  if (!paidEnabled || !openai) {
    const reason = !allowPaid
      ? "ALLOW_OPENAI_PAID=false"
      : useMockFlag
        ? "USE_MOCK_AI=true"
        : !apiKey
          ? "OPENAI_API_KEY missing"
          : "Unknown gating";
    return mockSummary(description, reason);
  }
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an insurance claim assistant. Summarize the following claim description in exactly 2 clear, concise sentences.",
        },
        {
          role: "user",
          content: description,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      warn("empty", "Empty response from OpenAI, using mock");
      return mockSummary(description, "Empty API response");
    }
    return summary;
  } catch (e: any) {
    warn("error", "OpenAI call failed—falling back to mock", {
      error: e?.message || String(e),
    });
    return mockSummary(description, "API error");
  }
}
export async function categorizeClaimType(description: string): Promise<string> {
  if (!paidEnabled || !openai) {
    const reason = !allowPaid
      ? "ALLOW_OPENAI_PAID=false"
      : useMockFlag
        ? "USE_MOCK_AI=true"
        : !apiKey
          ? "OPENAI_API_KEY missing"
          : "Unknown gating";
    warn("mock-cat", `Using mock categorization: ${reason}`);
    return mockCategorize(description);
  }
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Categorize this insurance claim into one of: auto, property, health, life, liability, other. Reply with only the category (one word).",
        },
        {
          role: "user",
          content: description,
        },
      ],
      max_tokens: 8,
      temperature: 0.1,
    });
    const raw = response.choices[0]?.message?.content;
    const cat = normalizeCategory(raw);
    if (cat === "other" && !raw) {
      warn("empty-cat", "Empty category from API, using mock");
      return mockCategorize(description);
    }
    return cat;
  } catch (e: any) {
    warn("error-cat", "OpenAI categorize failed—using mock", {
      error: e?.message || String(e),
    });
    return mockCategorize(description);
  }
}
export async function assessClaimUrgency(description: string): Promise<"low" | "medium" | "high"> {
  if (!paidEnabled || !openai) {
    const reason = !allowPaid
      ? "ALLOW_OPENAI_PAID=false"
      : useMockFlag
        ? "USE_MOCK_AI=true"
        : !apiKey
          ? "OPENAI_API_KEY missing"
          : "Unknown gating";
    warn("mock-urgency", `Using mock urgency: ${reason}`);
    return mockUrgency(description);
  }
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Assess the urgency of this insurance claim. Consider injuries, property damage, and time-sensitivity. Reply with only one word: low, medium, or high.",
        },
        {
          role: "user",
          content: description,
        },
      ],
      max_tokens: 5,
      temperature: 0.1,
    });
    const raw = (response.choices[0]?.message?.content || "").toLowerCase().trim();
    if (raw === "low" || raw === "medium" || raw === "high")
      return raw as "low" | "medium" | "high";
    warn("unexpected-urgency", "Unexpected urgency output—using mock", {
      raw,
    });
    return mockUrgency(description);
  } catch (e: any) {
    warn("error-urgency", "OpenAI urgency failed—using mock", {
      error: e?.message || String(e),
    });
    return mockUrgency(description);
  }
}
export function getAIServiceStatus() {
  return {
    configuredKey: !!apiKey,
    paidEnabled,
    allowPaid,
    useMockFlag,
    model,
    provider: "OpenAI",
    effectiveMode: paidEnabled ? "paid" : "free-mock",
  };
}
