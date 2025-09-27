import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

/**
 * ===========
 * ENV / CONFIG
 * ===========
 */
const orKey = process.env.OPENROUTER_API_KEY || "";
const orBase = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const orModel = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1:free";

const refHeader = process.env.OPENROUTER_HTTP_REFERER || "";
const titleHeader = process.env.OPENROUTER_X_TITLE || "";

const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || "100", 10);
const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || "0.3");

const allowPaid = process.env.ALLOW_OPENROUTER_PAID === "true" || process.env.ALLOW_AI_PAID === "true";
const useMockFlag = process.env.USE_MOCK_AI === "true";

const paidEnabled = allowPaid && !useMockFlag && !!orKey;

// OpenAI SDK works with OpenRouter by overriding baseURL + apiKey
const client = paidEnabled
  ? new OpenAI({
      apiKey: orKey,
      baseURL: orBase,
    })
  : null;

/**
 * ===========
 * FREE MODELS TO TRY (IN ORDER OF PREFERENCE)
 * ===========
 */
const FREE_MODELS = [
  "google/gemini-flash-1.5:free",
  "meta-llama/llama-3.2-3b-instruct:free", 
  "microsoft/phi-3-mini-128k-instruct:free",
  "deepseek/deepseek-r1:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "huggingface/zephyr-7b-beta:free"
];

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

function info(label: string, msg: string, extra?: Record<string, unknown>) {
  const base = `[AI:${label}] ${msg}`;
  if (extra) console.log(base, extra);
  else console.log(base);
}

function mockSummary(description: string, reason: string): string {
  warn("mock", `Using mock summary: ${reason}`);
  const d = description ?? "";
  const truncated = d.substring(0, 150);
  return `[Mock Summary] ${truncated}${d.length > 150 ? "..." : ""}`;
}

function normalizeCategory(s?: string | null): string {
  const v = (s || "").toLowerCase().trim();
  if (["auto", "property", "health", "life", "liability", "other"].includes(v))
    return v;
  return "other";
}

function mockCategorize(description: string): string {
  const d = (description || "").toLowerCase();
  if (/\b(car|vehicle|accident|rear[- ]?end|bumper|fender|collision)\b/.test(d))
    return "auto";
  if (/\b(water|flood|fire|smoke|roof|pipe|leak|storm|theft|burglary|home|house)\b/.test(d))
    return "property";
  if (/\b(hospital|injur(?:y|ies)|doctor|medical|treatment|surgery)\b/.test(d))
    return "health";
  if (/\b(life insurance|policyholder deceased|death|beneficiary)\b/.test(d))
    return "life";
  if (/\b(liability|negligence|third[- ]?party|lawsuit|slip and fall)\b/.test(d))
    return "liability";
  return "other";
}

function mockUrgency(description: string): "low" | "medium" | "high" {
  const d = (description || "").toLowerCase();
  if (/\b(injury|injuries|hospital|emergency|urgent|immediate|unsafe|gas leak|electrical fire)\b/.test(d))
    return "high";
  if (/\b(flood|burst pipe|no power|roof leak|major damage|theft ongoing)\b/.test(d))
    return "high";
  if (/\b(minor|cosmetic|scratch|small dent|no injuries|no rush)\b/.test(d))
    return "low";
  return "medium";
}

/**
 * ============================
 * MULTI-MODEL CHAT CALL WITH FALLBACK
 * ============================
 */
type ChatParams = {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  max_tokens?: number;
  temperature?: number;
};

async function callChatWithFallback({
  messages,
  max_tokens,
  temperature,
}: ChatParams): Promise<{ content: string; modelUsed: string }> {
  if (!paidEnabled) throw new Error("paidDisabled");
  if (!client) throw new Error("clientNotConfigured");

  // Build request-level headers
  const extra_headers: Record<string, string> = {};
  if (refHeader) extra_headers["HTTP-Referer"] = refHeader;
  if (titleHeader) extra_headers["X-Title"] = titleHeader;

  // Try the configured model first, then fallback to the list
  const modelsToTry = [orModel, ...FREE_MODELS.filter(m => m !== orModel)];
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    
    try {
      info("trying", `Attempting model ${i + 1}/${modelsToTry.length}: ${model}`);
      
      const body = {
        model,
        messages,
        max_tokens: max_tokens ?? maxTokens,
        temperature: temperature ?? 0.2,
      };

      const resp = await client.chat.completions.create(body, {
        headers: extra_headers,
      });

      const content = resp.choices?.[0]?.message?.content?.trim();
      if (!content) {
        warn("empty", `Model ${model} returned empty response, trying next...`);
        continue;
      }

      info("success", `✅ Model ${model} succeeded!`);
      return { content, modelUsed: model };
      
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const status = error?.status || error?.response?.status;
      
      warn("model-failed", `Model ${model} failed (${status}): ${errorMsg}`);
      
      // If it's the last model, throw the error
      if (i === modelsToTry.length - 1) {
        throw new Error(`All models failed. Last error: ${errorMsg}`);
      }
      
      // For rate limits or temporary errors, add a small delay before trying next model
      if (status === 429 || status >= 500) {
        info("delay", `Waiting 1s before trying next model...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw new Error("All models exhausted");
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
    info("start", "Starting AI summary generation...");
    
    const result = await callChatWithFallback({
      messages: [
        {
          role: "system",
          content: "You are an insurance claim assistant. Summarize the following claim description in exactly 2 clear, concise sentences.",
        },
        { role: "user", content: description },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    
    info("summary-success", `Generated summary using ${result.modelUsed}`);
    return result.content;
    
  } catch (e: any) {
    warn("error", "All OpenRouter models failed — using mock", {
      error: e?.message || String(e),
    });
    return mockSummary(description, "All models failed");
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
    info("start", "Starting AI categorization...");
    
    const result = await callChatWithFallback({
      messages: [
        {
          role: "system",
          content: "Categorize this insurance claim into one of: auto, property, health, life, liability, other. Reply with only the category (one word).",
        },
        { role: "user", content: description },
      ],
      max_tokens: 8,
      temperature: 0.1,
    });

    // Sometimes models add punctuation/newlines — normalize safely
    const cat = normalizeCategory(result.content.split(/\s+/)[0]);
    if (cat === "other" && !result.content) {
      warn("empty-cat", "Empty category from API, using mock");
      return mockCategorize(description);
    }
    
    info("cat-success", `Categorized as "${cat}" using ${result.modelUsed}`);
    return cat;
    
  } catch (e: any) {
    warn("error-cat", "All OpenRouter models failed — using mock", {
      error: e?.message || String(e),
    });
    return mockCategorize(description);
  }
}

export async function assessClaimUrgency(description: string): Promise<"low" | "medium" | "high"> {
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
    info("start", "Starting AI urgency assessment...");
    
    const result = await callChatWithFallback({
      messages: [
        {
          role: "system",
          content: "Assess the urgency of this insurance claim. Consider injuries, property damage, and time-sensitivity. Reply with only one word: low, medium, or high.",
        },
        { role: "user", content: description },
      ],
      max_tokens: 5,
      temperature: 0.1,
    });

    const raw = (result.content || "").toLowerCase().trim();
    if (raw === "low" || raw === "medium" || raw === "high") {
      info("urgency-success", `Assessed as "${raw}" using ${result.modelUsed}`);
      return raw as "low" | "medium" | "high";
    }
    
    // In case the model adds extra text, try to parse the first token
    const first = raw.split(/\s+/)[0];
    if (first === "low" || first === "medium" || first === "high") {
      info("urgency-success", `Assessed as "${first}" using ${result.modelUsed}`);
      return first as "low" | "medium" | "high";
    }

    warn("unexpected-urgency", "Unexpected urgency output — using mock", {
      raw,
      model: result.modelUsed,
    });
    return mockUrgency(description);
    
  } catch (e: any) {
    warn("error-urgency", "All OpenRouter models failed — using mock", {
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
    primaryModel: orModel,
    fallbackModels: FREE_MODELS,
    baseUrl: orBase,
    effectiveMode: paidEnabled ? "openrouter-with-fallback" : "free-mock",
  };
}

// Export the model list for debugging
export function getAvailableModels() {
  return {
    primary: orModel,
    fallbacks: FREE_MODELS,
    all: [orModel, ...FREE_MODELS.filter(m => m !== orModel)],
  };
}
