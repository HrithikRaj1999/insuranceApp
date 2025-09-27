// aiService.ts — OpenRouter-only (OpenAI SDK pointed at OpenRouter)
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

/**
 * ===========
 * ENV / CONFIG
 * ===========
 * Required:
 *   OPENROUTER_API_KEY
 * Optional but recommended:
 *   OPENROUTER_MODEL           (e.g., "deepseek/deepseek-r1:free" or "openai/gpt-4o")
 *   OPENROUTER_BASE_URL        (default "https://openrouter.ai/api/v1")
 *   OPENROUTER_HTTP_REFERER    (your site URL for rankings)
 *   OPENROUTER_X_TITLE         (your app name for rankings)
 * Gating / knobs (reuse your old ones):
 *   ALLOW_OPENROUTER_PAID=true|false
 *   USE_MOCK_AI=true|false
 *   OPENAI_MAX_TOKENS=120
 *   OPENAI_TEMPERATURE=0.3
 */
const orKey = process.env.OPENROUTER_API_KEY || "";
const orBase = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const orModel = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1:free";

const refHeader = process.env.OPENROUTER_HTTP_REFERER || "";
const titleHeader = process.env.OPENROUTER_X_TITLE || "";

const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || "100", 10);
const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || "0.3");

const allowPaid =
  process.env.ALLOW_OPENROUTER_PAID === "true" ||
  process.env.ALLOW_AI_PAID === "true"; // keep compatibility with your old knob
const useMockFlag = process.env.USE_MOCK_AI === "true";

const paidEnabled = allowPaid && !useMockFlag && !!orKey;

// OpenAI SDK works with OpenRouter by overriding baseURL + apiKey
// Docs: set base to https://openrouter.ai/api/v1 and use your OpenRouter API key.
const client =
  paidEnabled
    ? new OpenAI({
        apiKey: orKey,
        baseURL: orBase,
      })
    : null;

/**
 * ===========
 * UTILITIES
 * ===========
 */
function warn(label: string, msg: string, extra?: Record<string, unknown>) {
  const base = `[AI:${label}] ${msg}`;
  if (extra) console.warn(base, extra);
  else console.warn(base);
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
  if (/\b(water|flood|fire|smoke|roof|pipe|leak|storm|theft|burglary|home|house)\b/.test(d))
    return "property";
  if (/\b(hospital|injur(?:y|ies)|doctor|medical|treatment|surgery)\b/.test(d)) return "health";
  if (/\b(life insurance|policyholder deceased|death|beneficiary)\b/.test(d)) return "life";
  if (/\b(liability|negligence|third[- ]?party|lawsuit|slip and fall)\b/.test(d)) return "liability";
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

/**
 * ============================
 * LOW-LEVEL CHAT CALL
 * ============================
 */
type ChatParams = {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  max_tokens?: number;
  temperature?: number;
};

async function callChat({
  model,
  messages,
  max_tokens,
  temperature,
}: ChatParams): Promise<string> {
  if (!paidEnabled) throw new Error("paidDisabled");
  if (!client) throw new Error("clientNotConfigured");

  const extra_headers: Record<string, string> = {};
  if (refHeader) extra_headers["HTTP-Referer"] = refHeader; // attribution headers (optional)
  if (titleHeader) extra_headers["X-Title"] = titleHeader;

  const resp = await client.chat.completions.create({
    model,
    messages,
    max_tokens: max_tokens ?? maxTokens,
    temperature: temperature ?? 0.2,
    extra_headers,
  });

  const content = resp.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("emptyResponse");
  return content;
}

/**
 * ===========
 * PUBLIC APIs
 * ===========
 */
export async function generateSummary(description: string): Promise<string> {
  if (!description || description.trim().length === 0) {
    return "[Mock Summary] Empty description provided.";
  }

  if (!paidEnabled) {
    const reason = !allowPaid
      ? "ALLOW_OPENROUTER_PAID=false"
      : useMockFlag
      ? "USE_MOCK_AI=true"
      : !orKey
      ? "OPENROUTER_API_KEY missing"
      : "Unknown gating";
    return mockSummary(description, reason);
  }

  try {
    const content = await callChat({
      model: orModel,
      messages: [
        {
          role: "system",
          content:
            "You are an insurance claim assistant. Summarize the following claim description in exactly 2 clear, concise sentences.",
        },
        { role: "user", content: description },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    return content;
  } catch (e: any) {
    warn("error", "OpenRouter call failed — using mock", { error: e?.message || String(e) });
    return mockSummary(description, "API error");
  }
}

export async function categorizeClaimType(description: string): Promise<string> {
  if (!paidEnabled) {
    const reason = !allowPaid
      ? "ALLOW_OPENROUTER_PAID=false"
      : useMockFlag
      ? "USE_MOCK_AI=true"
      : !orKey
      ? "OPENROUTER_API_KEY missing"
      : "Unknown gating";
    warn("mock-cat", `Using mock categorization: ${reason}`);
    return mockCategorize(description);
  }

  try {
    const content = await callChat({
      model: orModel,
      messages: [
        {
          role: "system",
          content:
            "Categorize this insurance claim into one of: auto, property, health, life, liability, other. Reply with only the category (one word).",
        },
        { role: "user", content: description },
      ],
      max_tokens: 8,
      temperature: 0.1,
    });
    const cat = normalizeCategory(content);
    if (cat === "other" && !content) {
      warn("empty-cat", "Empty category from API, using mock");
      return mockCategorize(description);
    }
    return cat;
  } catch (e: any) {
    warn("error-cat", "OpenRouter categorize failed — using mock", { error: e?.message || String(e) });
    return mockCategorize(description);
  }
}

export async function assessClaimUrgency(
  description: string
): Promise<"low" | "medium" | "high"> {
  if (!paidEnabled) {
    const reason = !allowPaid
      ? "ALLOW_OPENROUTER_PAID=false"
      : useMockFlag
      ? "USE_MOCK_AI=true"
      : !orKey
      ? "OPENROUTER_API_KEY missing"
      : "Unknown gating";
    warn("mock-urgency", `Using mock urgency: ${reason}`);
    return mockUrgency(description);
  }

  try {
    const content = await callChat({
      model: orModel,
      messages: [
        {
          role: "system",
          content:
            "Assess the urgency of this insurance claim. Consider injuries, property damage, and time-sensitivity. Reply with only one word: low, medium, or high.",
        },
        { role: "user", content: description },
      ],
      max_tokens: 5,
      temperature: 0.1,
    });

    const raw = (content || "").toLowerCase().trim();
    if (raw === "low" || raw === "medium" || raw === "high") return raw as "low" | "medium" | "high";
    warn("unexpected-urgency", "Unexpected urgency output — using mock", { raw });
    return mockUrgency(description);
  } catch (e: any) {
    warn("error-urgency", "OpenRouter urgency failed — using mock", {
      error: e?.message || String(e),
    });
    return mockUrgency(description);
  }
}

export function getAIServiceStatus() {
  return {
    configuredKey: !!orKey,
    paidEnabled,
    allowPaid,
    useMockFlag,
    provider: "openrouter",
    model: orModel,
    baseUrl: orBase,
    effectiveMode: paidEnabled ? "openrouter-paid-or-free-model" : "free-mock",
  };
}
