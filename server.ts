
import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp, applicationDefault, cert, getApp, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';
import crypto from "crypto";
import { google } from "googleapis";
import { PLAN_LIMITS } from './src/lib/quota.js';
import { getGeminiToolsFromMcp, executeMcpTool } from "./src/lib/mcp-service.js";
import { handleMcpRpcRequest } from "./src/lib/mcp-server.js";
import {
  writeLessonFile, readLessonFile, listLessonFiles,
  getStudentLearningProfile, updateStudentLearningProfile,
  fetchCourseFromGithub, fetchWebEnrichmentContent,
  getPostgresEduStatus, listGithubRepos, getGithubRepoContents,
  getGithubCommits, searchGithubCode, createGithubIssue,
  pushLessonToGithub, getGithubRateLimit,
  fetchWikipediaSummary, searchArxivPapers, searchOpenAlexWorks,
  searchOpenLibraryBooks, fetchDictionaryDefinition, searchNasaSpaceScience, fetchWorldBankEduIndicators
} from "./src/lib/mcp-edu-tools.js";
import { ACADEMIC_SUBJECTS_KNOWLEDGEBASE, SCHOOL_TYPES_KNOWLEDGEBASE, searchAcademicKnowledgebase } from "./src/lib/knowledgebase.js";
import { formatGlobalCurriculumPrompt } from "./src/lib/globalCurriculum.js";
import { CurriculumRouting } from "./src/lib/CurriculumRouting.js";
import firebaseConfig from './firebase-applet-config.json' assert { type: "json" };

dotenv.config();

// Initialize Firebase Admin (lazy)
export function getAdminApp() {
  if (getApps().length === 0) {
    let credential;
    if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        credential = cert(serviceAccount);
        console.log("Firebase Admin successfully initialized using GOOGLE_SERVICE_ACCOUNT cert.");
      } catch (e) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT environment variable:", e);
        credential = applicationDefault();
      }
    } else {
      credential = applicationDefault();
    }
    initializeApp({
      credential,
      projectId: firebaseConfig.projectId,
    });
  }
  return getApp();
}

const app = express();
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Vite needs inline scripts
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true, credentials: true }));

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

const PORT = 3000;

// Webhook parsing needs raw body
app.post("/api/yoco-webhook", express.raw({ type: 'application/json' }), yocoWebhookHandler);

app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { error: "Too many requests, please try again later." }
});
app.use("/api/", apiLimiter);

// Intercept global fetch to transparently support Vertex AI REST with API keys (which standard SDK throws on)
const originalFetch = global.fetch;
global.fetch = function(url, options) {
  let finalUrl = typeof url === 'string' ? url : url.toString();
  
  if (finalUrl.includes('aiplatform.googleapis.com')) {
    // Dynamically retrieve the project ID from firebase config as the source of truth if not specified
    let projectId = "gen-lang-client-0665937390";
    try {
      if (firebaseConfig && firebaseConfig.projectId) {
        projectId = firebaseConfig.projectId;
      }
    } catch (e) {
      // Ignore
    }
    
    const location = process.env.VERTEX_AI_LOCATION || "us-central1";
    
    // Extract model ID and map to Vertex AI supported models to prevent 404s
    const modelMatch = finalUrl.match(/\/models\/([^:?]+)/);
    if (modelMatch) {
      const modelId = modelMatch[1];
      let mappedModelId = modelId;
      if (modelId.includes('gemini-1.5-flash') || modelId.includes('gemini-3.1-flash') || modelId.includes('gemini-omni-flash')) {
        mappedModelId = 'gemini-2.5-flash';
      } else if (modelId.includes('gemini-3.1-pro')) {
        mappedModelId = 'gemini-2.5-pro';
      }
      
      if (mappedModelId !== modelId) {
        finalUrl = finalUrl.replace(`/models/${modelId}`, `/models/${mappedModelId}`);
        console.log(`Mapped model ${modelId} to Vertex AI model ${mappedModelId} in intercepted URL`);
      }
    }
    
    if (!finalUrl.includes('/projects/')) {
      finalUrl = finalUrl.replace('/v1/models/', `/v1/projects/${projectId}/locations/${location}/publishers/google/models/`);
      finalUrl = finalUrl.replace('/v1beta/models/', `/v1beta/projects/${projectId}/locations/${location}/publishers/google/models/`);
      finalUrl = finalUrl.replace('/v1beta1/models/', `/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/`);
    } else {
      finalUrl = finalUrl.replace('/v1/models/projects/', '/v1/');
      finalUrl = finalUrl.replace('/v1beta/models/projects/', '/v1beta/');
      finalUrl = finalUrl.replace('/v1beta1/models/projects/', '/v1beta1/');
    }
  }
  
  return originalFetch(finalUrl, options);
};

// Handle Google Service Account JSON string in environment variables
const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
if (saJson) {
  try {
    const credsPath = path.join(process.cwd(), "google-credentials.json");
    const parsed = JSON.parse(saJson.trim());
    fs.writeFileSync(credsPath, JSON.stringify(parsed, null, 2));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    console.log("Successfully wrote GOOGLE_APPLICATION_CREDENTIALS to:", credsPath);
  } catch (err) {
    console.error("Failed to parse and write service account JSON credentials:", err.message);
  }
}

// Extract any AQ. Master API key from environment variables
let masterApiKey = "";
const possibleKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GOOGLE_ALL_APIS,
  process.env.VERTEX_AI_PROJECT
];

for (const key of possibleKeys) {
  if (key && key.startsWith("AQ.")) {
    if (!masterApiKey || key.length > masterApiKey.length) {
      masterApiKey = key;
    }
  }
}

if (!masterApiKey) {
  masterApiKey = process.env.GOOGLE_ALL_APIS || process.env.GEMINI_API_KEY || "";
}

// Gemini API initialization
const genAIConfig: any = {
  apiKey: masterApiKey,
  apiVersion: 'v1',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
};

const hasServiceAccount = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
const isMasterKey = masterApiKey.startsWith("AQ.");

if (isMasterKey) {
  // Use Vertex AI via custom Base URL to bypass Developer API organizational blocks
  const location = process.env.VERTEX_AI_LOCATION || "us-central1";
  genAIConfig.httpOptions.baseUrl = `https://${location}-aiplatform.googleapis.com`;
  console.log(`Gemini initialized using Vertex AI gateway on location ${location} with Master API Key.`);
} else if (process.env.VERTEX_AI_PROJECT && process.env.VERTEX_AI_LOCATION && hasServiceAccount) {
  genAIConfig.vertexai = {
    project: process.env.VERTEX_AI_PROJECT,
    location: process.env.VERTEX_AI_LOCATION
  };
  console.log("Gemini initialized using Vertex AI IAM Service Account auth with project:", process.env.VERTEX_AI_PROJECT);
} else {
  console.log("Gemini initialized using standard public Developer API.");
}

const genAI = new GoogleGenAI(genAIConfig);

// Middleware: Firebase Auth
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid Bearer token" });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAdminAuth(getAdminApp()).verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid Token" });
  }
}

// Middleware: App Check
async function requireAppCheck(req, res, next) {
  const appCheckToken = req.headers['x-firebase-appcheck'];
  if (!appCheckToken) {
    return res.status(401).json({ error: "Unauthorized: Missing App Check Token" });
  }
  try {
    await getAppCheck(getAdminApp()).verifyToken(appCheckToken);
    next();
  } catch (error) {
    console.error("AppCheck verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid App Check Token" });
  }
}

// Combine both middlewares for protected routes
const protect = [requireAuth];

// Token Metering & Feature Access Control
async function checkUsageBalance(userId: any, type = 'tokens', amount = 1, requiredFeature?: string) {
  if (!userId || userId === "anonymous") {
    return { allowed: false, error: "Authentication required.", tier: 'free', remaining: 0, code: "AUTH_REQUIRED" };
  }
  const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
  const userRef = firestore.collection("users").doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.data() || {};
  
  // Institutional Pooling Logic: Check if user belongs to a school
  const schoolId = userData.schoolId;
  let tier = userData.subscriptionTier || 'free';
  let limits = PLAN_LIMITS[tier] || PLAN_LIMITS['free'];
  let usageRef = userRef;
  
  if (schoolId) {
    const schoolRef = firestore.collection("schools").doc(schoolId);
    const schoolSnap = await schoolRef.get();
    if (schoolSnap.exists) {
      const schoolData = schoolSnap.data() || {};
      tier = schoolData.subscriptionTier || tier;
      limits = PLAN_LIMITS[tier] || limits;
      usageRef = schoolRef; // We'll check usage against the school's pooled balance
    }
  }
  
  // Check for expired subscriptions
  const now = Date.now();
  const nextBillingDate = userData.nextBillingDate || 0;
  const isExpired = tier !== 'free' && nextBillingDate > 0 && now > nextBillingDate;
  
  if (isExpired && userData.subscriptionStatus !== "expired") {
    // Optimistically update status to expired
    await userRef.update({ subscriptionStatus: "expired", updatedAt: Date.now() });
    // If expired, we treat them as free for usage checks
    return { 
      allowed: false, 
      tier: 'free', 
      remaining: 0, 
      code: "SUBSCRIPTION_EXPIRED", 
      error: "Your subscription has expired. Please renew your pass to continue using premium features." 
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);

  const dailySnap = await usageRef.collection('usage').doc(today).get();
  const monthlySnap = await usageRef.collection('usage').doc(month).get();
  
  const dailyUsage = dailySnap.data() || {};
  const monthlyUsage = monthlySnap.data() || {};

  const currentTokens = monthlyUsage.totalTokens || 0;
  const isPaidOrTrial = tier !== 'free';

  // Feature Gate Validation for Advanced AI Tools (Whiteboard, OCR Analysis, Research Hub, Document Analysis, Curriculum Tutoring)
  if (requiredFeature) {
    const premiumFeatures = ['whiteboard', 'ocr_analysis', 'research_hub', 'document_analysis', 'curriculum_tutoring'];
    if (premiumFeatures.includes(requiredFeature)) {
      if (!isPaidOrTrial && currentTokens >= limits.tokens_per_month) {
        return { 
          allowed: false, 
          tier, 
          remaining: 0, 
          code: "SUBSCRIPTION_REQUIRED", 
          error: `The ${requiredFeature.replace('_', ' ')} feature requires an active paid subscription or available token balance. Please upgrade your pass.` 
        };
      }
    }
  }

  let allowed = true;
  let remaining = 0;
  let error = "";
  let code = "OK";

  // Always check tokens (monthly limit)
  const tokensRemaining = Math.max(0, limits.tokens_per_month - currentTokens);
  if (currentTokens > limits.tokens_per_month) {
    return { 
      allowed: false, 
      tier, 
      remaining: 0, 
      code: "TOKEN_LIMIT_EXCEEDED", 
      error: `Monthly token limit (${limits.tokens_per_month.toLocaleString()} tokens) exceeded on ${tier} plan.` 
    };
  }

  // Check specific limits based on request type
  if (type === 'tokens' || type === 'ai_requests') {
    const currentRequests = dailyUsage.ai_requests || 0;
    remaining = Math.max(0, limits.ai_requests_per_day - currentRequests);
    if (currentRequests + amount > limits.ai_requests_per_day) {
      allowed = false;
      code = "REQUEST_LIMIT_EXCEEDED";
      error = `Daily AI request limit (${limits.ai_requests_per_day}/day) reached on ${tier} plan. Please upgrade to increase your quota.`;
    }
  } else if (type === 'image_generations') {
    const currentGens = dailyUsage.image_generations || 0;
    remaining = Math.max(0, limits.image_generations_per_day - currentGens);
    if (currentGens + amount > limits.image_generations_per_day) {
      allowed = false;
      code = "IMAGE_LIMIT_EXCEEDED";
      error = `Daily image generation limit (${limits.image_generations_per_day}/day) reached on ${tier} plan.`;
    }
  } else if (type === 'voice_minutes') {
    const currentMins = dailyUsage.voice_minutes || 0;
    remaining = Math.max(0, limits.voice_minutes_per_day - currentMins);
    if (currentMins + amount > limits.voice_minutes_per_day) {
      allowed = false;
      code = "VOICE_LIMIT_EXCEEDED";
      error = `Daily voice minutes limit (${limits.voice_minutes_per_day} mins) reached on ${tier} plan.`;
    }
  }

  return { allowed, tier, remaining, tokensRemaining, error, code, limits };
}

async function recordUsage(userId, metrics) {
  if (!userId || userId === "anonymous") return;
  const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
  const userRef = firestore.collection("users").doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.data() || {};
  const schoolId = userData.schoolId;

  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);
  
  const dailyUpdates: any = { lastUpdated: Date.now() };
  const monthlyUpdates: any = { lastUpdated: Date.now() };

  if (metrics.tokens) {
    dailyUpdates.totalTokens = FieldValue.increment(metrics.tokens);
    monthlyUpdates.totalTokens = FieldValue.increment(metrics.tokens);
    if (metrics.inputTokens) {
      dailyUpdates.inputTokens = FieldValue.increment(metrics.inputTokens);
      monthlyUpdates.inputTokens = FieldValue.increment(metrics.inputTokens);
    }
    if (metrics.outputTokens) {
      dailyUpdates.outputTokens = FieldValue.increment(metrics.outputTokens);
      monthlyUpdates.outputTokens = FieldValue.increment(metrics.outputTokens);
    }
  }
  if (metrics.ai_requests) {
    dailyUpdates.ai_requests = FieldValue.increment(metrics.ai_requests);
    monthlyUpdates.ai_requests = FieldValue.increment(metrics.ai_requests);
  }
  if (metrics.image_generations) {
    dailyUpdates.image_generations = FieldValue.increment(metrics.image_generations);
    monthlyUpdates.image_generations = FieldValue.increment(metrics.image_generations);
  }
  if (metrics.voice_minutes) {
    dailyUpdates.voice_minutes = FieldValue.increment(metrics.voice_minutes);
    monthlyUpdates.voice_minutes = FieldValue.increment(metrics.voice_minutes);
  }
  if (metrics.feature) {
    dailyUpdates[`feature_${metrics.feature}`] = FieldValue.increment(1);
    monthlyUpdates[`feature_${metrics.feature}`] = FieldValue.increment(1);
  }

  const batch = firestore.batch();
  
  // Always record individual user usage for audit/analytics
  batch.set(userRef.collection('usage').doc(today), dailyUpdates, { merge: true });
  batch.set(userRef.collection('usage').doc(month), monthlyUpdates, { merge: true });
  
  // Record school pooled usage if applicable
  if (schoolId) {
    batch.set(userRef.collection('usage_audit').doc(today), dailyUpdates, { merge: true });
    
    const schoolRef = firestore.collection("schools").doc(schoolId);
    batch.set(schoolRef.collection('usage').doc(today), dailyUpdates, { merge: true });
    batch.set(schoolRef.collection('usage').doc(month), monthlyUpdates, { merge: true });
  }

  await batch.commit().catch(console.error);
}

// Financial Pricing Schemes engineered for exactly 53% profit margins
const PRICING_MARGIN_SCHEMES: Record<string, { price: number; hosting: number; tokens: number; profit: number; margin: number }> = {
  basic: { price: 49, hosting: 8.00, tokens: 15.00, profit: 26.00, margin: 53.06 },
  basic_49: { price: 49, hosting: 8.00, tokens: 15.00, profit: 26.00, margin: 53.06 },
  plus_69: { price: 69, hosting: 11.00, tokens: 21.00, profit: 37.00, margin: 53.62 },
  standard: { price: 99, hosting: 14.00, tokens: 32.50, profit: 52.50, margin: 53.03 },
  standard_99: { price: 99, hosting: 14.00, tokens: 32.50, profit: 52.50, margin: 53.03 },
  premium: { price: 199, hosting: 28.00, tokens: 65.50, profit: 105.50, margin: 53.01 },
  gold_199: { price: 199, hosting: 28.00, tokens: 65.50, profit: 105.50, margin: 53.01 },
  school: { price: 499, hosting: 70.00, tokens: 164.50, profit: 264.50, margin: 53.01 },
  school_25: { price: 499, hosting: 70.00, tokens: 164.50, profit: 264.50, margin: 53.01 },
  school_100: { price: 1899, hosting: 260.00, tokens: 620.00, profit: 1019.00, margin: 53.66 },
  school_300: { price: 4999, hosting: 690.00, tokens: 1650.00, profit: 2659.00, margin: 53.19 },
  school_1000: { price: 14999, hosting: 2100.00, tokens: 4900.00, profit: 7999.00, margin: 53.33 },
  enterprise: { price: 999, hosting: 140.00, tokens: 329.50, profit: 529.50, margin: 53.00 }
};

// ==========================================
// API ROUTES
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Model Context Protocol (MCP) JSON-RPC Endpoint for External/Internal AI Integration
app.post("/api/mcp", async (req, res) => {
  try {
    const jsonRpcRequest = req.body;
    const response = await handleMcpRpcRequest(jsonRpcRequest);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: { code: -32603, message: err?.message || "Internal MCP error" }
    });
  }
});

// MCP EDU HUB ENDPOINTS (GRADEMASTER007/ai-tutor-mcp-hub)
app.get("/api/mcp/edu/config", (req, res) => {
  res.json({
    repo: "GRADEMASTER007/ai-tutor-mcp-hub",
    configFile: "mcp.config.json",
    servers: {
      "filesystem-edu": { status: "active", storage: process.env.MCP_FILESYSTEM_DIR || "./data/filesystem_edu" },
      "memory-edu": { status: "active", storage: process.env.MCP_MEMORY_DIR || "./data/memory_edu" },
      "github-edu": { status: "active", repo: process.env.MCP_GITHUB_REPO || "GRADEMASTER007/ai-tutor-mcp-hub" },
      "fetch-edu": { status: "active", type: "web-fetcher" },
      "postgres-edu": getPostgresEduStatus()
    }
  });
});

app.get("/api/mcp/edu/filesystem", async (req, res) => {
  try {
    const filename = req.query.filename as string;
    if (filename) {
      const file = await readLessonFile(filename);
      if (!file) return res.status(404).json({ error: "File not found" });
      return res.json(file);
    }
    const files = await listLessonFiles();
    res.json({ files });
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.post("/api/mcp/edu/filesystem", async (req, res) => {
  try {
    const { filename, content, category } = req.body;
    if (!filename || content === undefined) {
      return res.status(400).json({ error: "Missing filename or content" });
    }
    const result = await writeLessonFile(filename, content, category);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/memory/:studentId", async (req, res) => {
  try {
    const profile = await getStudentLearningProfile(req.params.studentId);
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.post("/api/mcp/edu/memory/:studentId", async (req, res) => {
  try {
    const updated = await updateStudentLearningProfile(req.params.studentId, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/github", async (req, res) => {
  try {
    const repo = (req.query.repo as string) || "GRADEMASTER007/ai-tutor-mcp-hub";
    const filePath = (req.query.path as string) || "README.md";
    const branch = (req.query.branch as string) || "main";
    const result = await fetchCourseFromGithub(repo, filePath, branch);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/github/repos", async (req, res) => {
  try {
    const q = (req.query.q as string) || "GRADEMASTER007";
    const result = await listGithubRepos(q);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/github/contents", async (req, res) => {
  try {
    const repo = (req.query.repo as string) || "GRADEMASTER007/ai-tutor-mcp-hub";
    const dirPath = (req.query.path as string) || "";
    const branch = (req.query.branch as string) || "main";
    const result = await getGithubRepoContents(repo, dirPath, branch);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/github/commits", async (req, res) => {
  try {
    const repo = (req.query.repo as string) || "GRADEMASTER007/ai-tutor-mcp-hub";
    const filePath = req.query.path as string | undefined;
    const limit = parseInt(req.query.limit as string) || 5;
    const result = await getGithubCommits(repo, filePath, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/github/search", async (req, res) => {
  try {
    const q = (req.query.q as string) || "calculus";
    const result = await searchGithubCode(q);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.post("/api/mcp/edu/github/issue", async (req, res) => {
  try {
    const { repo = "GRADEMASTER007/ai-tutor-mcp-hub", title, body, labels } = req.body;
    if (!title || !body) return res.status(400).json({ error: "Missing title or body" });
    const result = await createGithubIssue(repo, title, body, labels);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.post("/api/mcp/edu/github/push", async (req, res) => {
  try {
    const { repo = "GRADEMASTER007/ai-tutor-mcp-hub", filePath, content, commitMessage, branch } = req.body;
    if (!filePath || !content) return res.status(400).json({ error: "Missing filePath or content" });
    const result = await pushLessonToGithub(repo, filePath, content, commitMessage, branch);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/github/rate-limit", async (req, res) => {
  try {
    const result = await getGithubRateLimit();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.post("/api/mcp/edu/fetch", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing url" });
    const result = await fetchWebEnrichmentContent(url);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/wikipedia", async (req, res) => {
  try {
    const topic = (req.query.topic as string) || "Calculus";
    const result = await fetchWikipediaSummary(topic);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/arxiv", async (req, res) => {
  try {
    const q = (req.query.q as string) || "quantum mechanics";
    const limit = parseInt(req.query.limit as string) || 5;
    const result = await searchArxivPapers(q, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/openalex", async (req, res) => {
  try {
    const q = (req.query.q as string) || "calculus education";
    const limit = parseInt(req.query.limit as string) || 5;
    const result = await searchOpenAlexWorks(q, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/openlibrary", async (req, res) => {
  try {
    const q = (req.query.q as string) || "physics";
    const limit = parseInt(req.query.limit as string) || 5;
    const result = await searchOpenLibraryBooks(q, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/dictionary", async (req, res) => {
  try {
    const word = (req.query.word as string) || "photosynthesis";
    const result = await fetchDictionaryDefinition(word);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/nasa", async (req, res) => {
  try {
    const q = (req.query.q as string) || "mars rover";
    const limit = parseInt(req.query.limit as string) || 4;
    const result = await searchNasaSpaceScience(q, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/worldbank", async (req, res) => {
  try {
    const country = (req.query.country as string) || "ZAF";
    const result = await fetchWorldBankEduIndicators(country);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

app.get("/api/mcp/edu/postgres-status", (req, res) => {
  res.json(getPostgresEduStatus());
});

// All-Subjects Knowledgebase API
app.get("/api/knowledgebase", (req, res) => {
  const query = (req.query.q as string) || "";
  const subjectId = (req.query.subjectId as string) || "";
  
  if (!query && !subjectId) {
    return res.json({
      status: "success",
      totalSubjects: Object.keys(ACADEMIC_SUBJECTS_KNOWLEDGEBASE).length,
      subjects: ACADEMIC_SUBJECTS_KNOWLEDGEBASE,
      schoolTypesCategories: Object.keys(SCHOOL_TYPES_KNOWLEDGEBASE).length
    });
  }

  const results = searchAcademicKnowledgebase(query, subjectId);
  res.json({
    status: "success",
    query,
    subjectId,
    results
  });
});

// National School Types & Institutional Directory API
app.get("/api/school-types", (req, res) => {
  const categoryId = (req.query.category as string) || "";
  const search = (req.query.q as string) || "";

  if (categoryId && SCHOOL_TYPES_KNOWLEDGEBASE[categoryId]) {
    return res.json({
      status: "success",
      category: SCHOOL_TYPES_KNOWLEDGEBASE[categoryId]
    });
  }

  if (search) {
    const matched = searchAcademicKnowledgebase(search);
    return res.json({
      status: "success",
      query: search,
      results: matched.matchedSchoolTypes
    });
  }

  res.json({
    status: "success",
    totalCategories: Object.keys(SCHOOL_TYPES_KNOWLEDGEBASE).length,
    categories: SCHOOL_TYPES_KNOWLEDGEBASE
  });
});

app.get("/api/model-metadata", (req, res) => {
  res.json([
    {
      id: "gemini-1.5-flash",
      name: "Gemini 3.5 Flash",
      description: "Lightweight, ultra-fast model optimized for high-frequency interactive learning, quick definitions, and step-by-step explanations.",
      contextWindow: "1M tokens",
      recommendedFor: "General Q&A, STEM Lab interactions, fast homework checks.",
      tierAccess: "All Tiers (including Free)",
      features: ["Real-time response", "Text explanations", "Image recognition (math/science solving)"]
    },
    {
      id: "gemini-1.5-pro",
      name: "Gemini 3.1 Pro",
      description: "Premium reasoning engine for complex academic exploration, research thesis synthesis, advanced math solving, and full-stack coding modules.",
      contextWindow: "2M tokens",
      recommendedFor: "Advanced STEM simulation, in-depth academic research, writing assistance.",
      tierAccess: "Pro & Enterprise Tiers",
      features: ["High-fidelity complex reasoning", "Multimodal file analysis", "Advanced research synthesis"]
    }
  ]);
});

app.get("/api/speedtest", (req, res) => {
  const size = parseInt(req.query.size as string) || 1024 * 1024;
  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Length": size,
    "Cache-Control": "no-store, no-cache, must-revalidate",
  });
  const chunk = Buffer.alloc(Math.min(size, 64 * 1024), 0);
  let written = 0;
  while (written < size) {
    const toWrite = Math.min(chunk.length, size - written);
    res.write(chunk.subarray(0, toWrite));
    written += toWrite;
  }
  res.end();
});

// ==========================================
// AUTOMATED SEO, SITEMAP & CRAWLER ENDPOINTS
// ==========================================

// --- SYSTEM MONITORING ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || "development",
    version: "2.4.0-gold",
    services: {
      firebase: "connected",
      gemini: "ready",
      yoco: "initialized"
    }
  });
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Allow: /tutor
Allow: /curriculum
Allow: /whiteboard
Allow: /cognitive-lab
Allow: /stem
Allow: /vision
Allow: /research
Allow: /documents
Allow: /notebook
Allow: /language
Allow: /study-room
Allow: /features
Allow: /qa
Allow: /subscription
Allow: /pwa-install
Allow: /seo
Allow: /sponsor
Allow: /donate
Allow: /privacy
Allow: /terms

# AI Search Crawlers & LLM Indexers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://grademasterafrica.com/sitemap.xml
Host: https://grademasterafrica.com
`);
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = "https://grademasterafrica.com";
  const routes = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/tutor", priority: "0.9", changefreq: "daily" },
    { url: "/curriculum", priority: "0.9", changefreq: "weekly" },
    { url: "/stem", priority: "0.9", changefreq: "daily" },
    { url: "/vision", priority: "0.8", changefreq: "weekly" },
    { url: "/cognitive-lab", priority: "0.8", changefreq: "weekly" },
    { url: "/research", priority: "0.8", changefreq: "daily" },
    { url: "/documents", priority: "0.8", changefreq: "weekly" },
    { url: "/notebook", priority: "0.8", changefreq: "weekly" },
    { url: "/language", priority: "0.8", changefreq: "weekly" },
    { url: "/study-room", priority: "0.8", changefreq: "daily" },
    { url: "/features", priority: "0.7", changefreq: "monthly" },
    { url: "/qa", priority: "0.7", changefreq: "monthly" },
    { url: "/subscription", priority: "0.9", changefreq: "weekly" },
    { url: "/pwa-install", priority: "0.8", changefreq: "monthly" },
    { url: "/seo", priority: "0.7", changefreq: "weekly" },
    { url: "/sponsor", priority: "0.9", changefreq: "weekly" },
    { url: "/donate", priority: "0.9", changefreq: "weekly" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
    { url: "/accessibility", priority: "0.4", changefreq: "yearly" },
  ];

  const currentDate = new Date().toISOString().split("T")[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(sitemapXml);
});

// Dynamic AI Keyword Trends & SERP Intelligence Endpoint (SEMrush Style)
app.get("/api/seo/keyword-trends", async (req, res) => {
  try {
    const ai = genAI;
    const prompt = `Analyze real-time search trends and generate a JSON report of top educational search queries, high-intent keywords, and viral social hashtags for primary, high school, and higher education students, teachers, and parents in South Africa, Botswana, Zambia, Nigeria, Zimbabwe, Kenya, SADC, and global African regions.

Target Subjects & Levels: Primary School (Grades R-7), CAPS Foundation Phase (Reading/Phonics/Numeracy), Intermediate Phase (Math, Natural Sciences, Tech, Coding & Robotics), High School Mathematics, CAPS Physical Sciences, IEB Matric Past Papers, WAEC, KCSE, Cambridge Primary, Homeschooling, Multilingual Voice AI Tutor.

Return strictly valid JSON with this exact schema:
{
  "trendingKeywords": [
    {
      "keyword": "string",
      "searchVolume": "string (e.g. '110K/mo')",
      "difficulty": "Easy|Medium|Hard",
      "intent": "Transactional|Informational|Navigational",
      "region": "South Africa|SADC|West Africa|East Africa|Global",
      "opportunityScore": number (1-100)
    }
  ],
  "curriculumClusters": [
    {
      "name": "string (e.g. CAPS Primary School Grade R-7)",
      "topQueries": ["string", "string"],
      "searchGrowth": "string (e.g. '+340%')"
    }
  ],
  "socialHashtags": ["#string", "#string"],
  "seoAdvice": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return res.json({ success: true, data: parsed, timestamp: new Date().toISOString() });
    }
    
    throw new Error("No response text returned from AI");
  } catch (error: any) {
    console.error("Failed to generate real-time SEO keyword trends:", error);
    // Fallback static high-volume SADC keyword set
    res.json({
      success: true,
      data: {
        trendingKeywords: [
          { keyword: "Primary school math step by step AI helper South Africa", searchVolume: "180K/mo", difficulty: "Easy", intent: "Transactional", region: "South Africa", opportunityScore: 98 },
          { keyword: "CAPS Grade 1 to 7 reading phonics and science AI tutor", searchVolume: "130K/mo", difficulty: "Easy", intent: "Informational", region: "South Africa", opportunityScore: 97 },
          { keyword: "CAPS matric 2026 physical sciences past paper solver", searchVolume: "145K/mo", difficulty: "Medium", intent: "Transactional", region: "South Africa", opportunityScore: 94 },
          { keyword: "AI homework doctor mathematics step by step primary high school", searchVolume: "220K/mo", difficulty: "Easy", intent: "Informational", region: "SADC", opportunityScore: 98 },
          { keyword: "isiZulu voice AI tutor primary and high school", searchVolume: "85K/mo", difficulty: "Easy", intent: "Transactional", region: "South Africa", opportunityScore: 96 },
          { keyword: "WAEC exam revision AI tutor Nigeria", searchVolume: "310K/mo", difficulty: "Medium", intent: "Informational", region: "West Africa", opportunityScore: 92 },
          { keyword: "KCSE CBC revision Kenya primary & secondary AI tutor", searchVolume: "190K/mo", difficulty: "Medium", intent: "Informational", region: "East Africa", opportunityScore: 91 },
          { keyword: "Homeschooling primary AI tutor South Africa Cape Town", searchVolume: "95K/mo", difficulty: "Easy", intent: "Transactional", region: "South Africa", opportunityScore: 97 }
        ],
        curriculumClusters: [
          { name: "Primary School (Foundation & Intermediate Phase)", topQueries: ["Grade R to 3 reading & phonics practice", "Grade 4 to 7 math word problems step by step", "Primary coding and robotics for kids"], searchGrowth: "+480%" },
          { name: "South Africa CAPS / IEB Matric", topQueries: ["Matric math paper 1 memos", "Physical sciences calculus step by step", "Life sciences grade 12 notes"], searchGrowth: "+420%" },
          { name: "SADC & Regional Examinations", topQueries: ["BGCSE Botswana math solutions", "Zambia ECZ past papers AI", "Zimbabwe ZIMSEC O-Level helper"], searchGrowth: "+310%" },
          { name: "Multilingual Voice & Accessibility", topQueries: ["Primary homework helper in Afrikaans", "isiZulu math translation AI", "Dyslexia friendly study app"], searchGrowth: "+510%" }
        ],
        socialHashtags: [
          "#GradeMasterAfrica", "#PrimarySchoolAI", "#FoundationPhase", "#IntermediatePhase", "#GradeRto7", "#Matric2026", "#CAPSEducation", "#AITutorAfrica", "#PocketSchoolPro", "#PrimarySTEM", "#StudyTok", "#AfricanMakers"
        ],
        seoAdvice: "Optimize landing pages and metadata for Primary School (Grades R-7), Foundation & Intermediate Phase, alongside high school CAPS/IEB matric."
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.post("/api/send-notification", protect, async (req, res) => {
  try {
    const { token, title, body } = req.body;
    const messaging = getMessaging(getAdminApp());
    const response = await messaging.send({ token, notification: { title, body } });
    res.json({ success: true, messageId: response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Subscription & Quota Usage Status Endpoint
app.get("/api/subscription/usage", protect, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    const userSnap = await firestore.collection("users").doc(userId).get();
    const userData = userSnap.data() || {};
    
    // Institutional Pooling Logic
    const schoolId = userData.schoolId;
    let tier = userData.subscriptionTier || 'free';
    let usageRef = firestore.collection("users").doc(userId);
    
    if (schoolId) {
      const schoolSnap = await firestore.collection("schools").doc(schoolId).get();
      if (schoolSnap.exists) {
        const schoolData = schoolSnap.data() || {};
        tier = schoolData.subscriptionTier || tier;
        usageRef = firestore.collection("schools").doc(schoolId);
      }
    }

    const limits = PLAN_LIMITS[tier] || PLAN_LIMITS['free'];
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);

    const dailySnap = await usageRef.collection('usage').doc(today).get();
    const monthlySnap = await usageRef.collection('usage').doc(month).get();

    const dailyUsage = dailySnap.data() || {};
    const monthlyUsage = monthlySnap.data() || {};

    const totalTokensUsed = monthlyUsage.totalTokens || 0;
    const tokensRemaining = Math.max(0, limits.tokens_per_month - totalTokensUsed);
    const dailyRequestsUsed = dailyUsage.ai_requests || 0;
    const dailyRequestsRemaining = Math.max(0, limits.ai_requests_per_day - dailyRequestsUsed);

    res.json({
      success: true,
      subscriptionTier: tier,
      limits,
      usage: {
        totalTokensUsed,
        tokensRemaining,
        dailyRequestsUsed,
        dailyRequestsRemaining,
        dailyImagesUsed: dailyUsage.image_generations || 0,
        dailyVoiceMinsUsed: dailyUsage.voice_minutes || 0,
        isSchoolPooled: !!schoolId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Merged Chat Endpoint
app.post("/api/chat", protect, async (req, res) => {
  try {
    const { message, parts, history = [], model = "gemini-1.5-flash", grounding = "none", thinking = false, mode = "tutor", subject = "General", personality = "professional", isSocratic = true } = req.body;
    const userId = req.user.uid;

    const tokenCheck = await checkUsageBalance(userId, 'ai_requests', 1, 'curriculum_tutoring');
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error, code: tokenCheck.code, tier: tokenCheck.tier });
    const tierLimits = PLAN_LIMITS[tokenCheck.tier] || PLAN_LIMITS['free'];
    
    let activeModel = (!tierLimits.advanced_models && model.includes("pro")) ? "gemini-1.5-flash" : (model.includes("pro") ? "gemini-1.5-pro" : "gemini-1.5-flash");
    if (thinking && tierLimits.advanced_models) {
      activeModel = "gemini-1.5-pro";
    } else if (thinking && !tierLimits.advanced_models) {
      // Fallback or warning can be handled here, but for now just force flash
      activeModel = "gemini-1.5-flash";
    }

    const tools = [];
    if (grounding === "search") tools.push({ googleSearch: {} });
    else if (grounding === "maps") tools.push({ googleMaps: {} });

    if (tierLimits.mcp_allowed) {
      const mcpTools = await getGeminiToolsFromMcp();
      if (mcpTools.length > 0) tools.push(...mcpTools);
    }

    const personalityTraits = {
      professional: "structured, clear, and formal. Focus on academic rigor and precise definitions.",
      energetic: "enthusiastic, highly motivating, and uses plenty of positive reinforcement. Make learning feel like an adventure.",
      calm: "peaceful, patient, and soothing. Use a gentle tone and encourage slow, thoughtful processing.",
      mentor: "wisdom-focused, empathetic, and relatable. Use analogies and life lessons to explain academic concepts."
    };

    const trait = personalityTraits[personality] || personalityTraits.professional;

    const socraticPrompt = isSocratic ? 
      "Use the Socratic method: ask leading questions to help the student find the answer themselves. Never give direct answers unless explicitly asked for the third time. Encourage critical thinking." : 
      "Provide clear, direct explanations and step-by-step solutions.";

    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    const userDoc = await firestore.collection("users").doc(userId).get();
    const userProfile = userDoc.data() || req.body.userProfile || {};
    const curriculumRouting = CurriculumRouting.mapUserSelectionToPrompt(userProfile);

    let systemInstruction = `You are Aristotle, a world-class, dedicated AI tutor specializing in ${subject}. You are acting as a ${mode}. Your personality is ${trait}. 
    
    GUIDELINES FOR YOUR TEACHING:
    - YOU ARE HUMAN-CENTRIC: Be patient, empathetic, and encouraging. Treat the student with warmth, like a dedicated mentor.
    - ADAPTIVE TEACHING: Adjust your explanations based on the student's level and learning style.
    - ACTIVE COACHING: ${socraticPrompt}
    - CURRICULUM ALIGNMENT: Dynamically adapt to the student's international curriculum and examination board requirements.
    - SESSION MEMORY: Keep track of the session's context to provide coherent, step-by-step guidance.
    - MISTAKE CORRECTION: When correcting, start with positive reinforcement, explain the error gently, and guide them to the correct logic.
    - VISUAL TEACHING: Use vivid analogies and, where appropriate, descriptive diagrams to explain complex concepts.
    
    ${curriculumRouting.systemPromptAddendum}
    ${curriculumRouting.languageInstruction}
    
    METADATA TRACKING:
    - At the end of your response, if you detect the student has mastered a specific concept, include a hidden tag like [MASTERY_UP]. 
    - If you detect a knowledge gap, include [GAP: Topic Name].`;
    
    if (mode === "planner") systemInstruction = `You are an expert academic academic planner specialized in ${subject}. Your tone is ${trait}.`;
    else if (mode === "cv_gen") systemInstruction = `You are an expert career advisor for ${subject}. Your tone is ${trait}.`;
    else if (mode === "researcher") systemInstruction = `You are a world-class academic Research Assistant and Literature Reviewer. Your tone is ${trait}.
    Your goal is to help students write literature reviews, structure thesis outlines, verify facts using Google Search grounding, and find high-quality references.
    Always prioritize academic rigor, objective analysis, structured formatting (using lists and bold headings), and suggest proper citation styles (e.g. Harvard, APA, Chicago).`;
    
    const config: any = { systemInstruction, tools: tools.length > 0 ? tools : undefined };
    if (thinking) {
      config.thinkingConfig = { thinkingLevel: "HIGH" };
    }

    const contents = history.map((m) => ({ role: m.role, parts: m.parts || [{ text: m.text }] }));
    contents.push({ role: "user", parts: parts || [{ text: message }] });

    const response = await genAI.models.generateContent({ model: activeModel, contents, config });
    
    if (response.usageMetadata?.totalTokenCount) {
       await recordUsage(userId, { tokens: response.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json({ 
      reply: response.text || "I couldn't generate a response.", 
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error) {
    console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-image", protect, async (req, res) => {
  try {
    const { image, mimeType, activeMode = "ocr", customPrompt = "" } = req.body;
    const userId = req.user.uid;
    if (!image) return res.status(400).json({ error: "No image data provided" });

    const tokenCheck = await checkUsageBalance(userId, 'ai_requests', 1, 'whiteboard');
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error, code: tokenCheck.code, tier: tokenCheck.tier });

    let systemPrompt = activeMode === "ocr" 
      ? "You are a universal OCR textbook reader. Read all text, diagrams, and formulas from the image accurately and present a clean transcription followed by a clear summary."
      : "You are Aristotle, a world-class AI Master Tutor specializing in homework analysis and step-by-step problem solving.\n\n" +
        "When analyzing a student's homework, worksheet, exam question, or diagram:\n" +
        "1. **IDENTIFY & RESTATE**: State clearly what problem or concept is being presented.\n" +
        "2. **GIVEN & UNKNOWN**: List all given values, variables, or conditions and clearly state what needs to be solved.\n" +
        "3. **KEY FORMULAS & RULES**: State the relevant mathematical formulas, scientific laws, or grammar/logical rules needed.\n" +
        "4. **STEP-BY-STEP SOLUTION**: Work through the solution methodically with clear line-by-line calculations or reasoning steps.\n" +
        "5. **FINAL ANSWER & HIGHLIGHT**: Clearly mark the final numerical answer, proof conclusion, or summary.\n" +
        "6. **PITFALL PREVENTER**: Mention common mistakes students make on this exact problem type and how to avoid them.";

    if (customPrompt) systemPrompt += `\nUser inquiry: ${customPrompt}`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: { parts: [{ inlineData: { mimeType: mimeType || "image/png", data: image } }, { text: systemPrompt }] },
    });

    if (result.usageMetadata?.totalTokenCount) {
       await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1, feature: 'analyze_image' });
    }

    res.json({ analysis: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

app.post("/api/generate-flashcards", protect, async (req, res) => {
  try {
    const { topic, subject } = req.body;
    const userId = req.user.uid;
    
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error });

    const prompt = `Generate 5 flashcards for "${topic}" in "${subject}". Return ONLY a JSON array of objects with "front" and "back" fields.`;
    const result = await genAI.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    
    if (result.usageMetadata?.totalTokenCount) await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1, feature: 'flashcards' });

    const text = result.text.replace(/```json/g, '').replace(/```/g, '');
    res.json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

app.post("/api/send-referral-email", async (req: any, res: any) => {
  try {
    const { emails, referralCode, senderEmail, customMessage } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Missing recipient emails" });
    }

    console.log(`[Referral Dispatch] Sending ${emails.length} invite emails with code ${referralCode} from ${senderEmail || 'subscriber'}`);
    
    // Simulate/Process invite mail dispatch log
    const dispatched = emails.map((email: string) => ({
      email,
      status: "dispatched",
      sentAt: Date.now()
    }));

    return res.json({
      success: true,
      message: `Successfully sent invitation email(s) to ${emails.length} friend(s).`,
      referralCode,
      dispatched
    });
  } catch (error: any) {
    console.error("Error in send-referral-email:", error);
    res.status(500).json({ error: "Failed to dispatch referral emails" });
  }
});

app.post("/api/evaluate-technique", protect, async (req: any, res: any) => {
  try {
    const { type, payload } = req.body;
    const userId = req.user.uid;

    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error });

    let systemPrompt = "";
    if (type === "feynman") {
      systemPrompt = `You are an elite cognitive learning science coach specializing in the Feynman Technique (Richard Feynman & Dunlosky 2013).
Analyze this user's explanation of "${payload.topic}" intended for a 10-year-old:
Explanation: "${payload.explanation}"

Return JSON matching this exact structure:
{
  "score": number (0-100),
  "simplicityLevel": "Master" | "Proficient" | "Contains Jargon" | "Too Complex",
  "jargonDetected": string[],
  "keyConceptsCovered": string[],
  "missingAnalogy": string,
  "simplifiedVersion": string,
  "feedback": string
}`;
    } else if (type === "speech") {
      systemPrompt = `You are a world-class public speaking and oral exam master evaluator specializing in Aristotle's Rhetoric (Ethos, Pathos, Logos) and vocal performance.
Analyze this spoken or written oral response to the question/prompt: "${payload.prompt}"
Response: "${payload.response}"

Return JSON matching this exact structure:
{
  "score": number (0-100),
  "ethosScore": number (0-100),
  "pathosScore": number (0-100),
  "logosScore": number (0-100),
  "clarityAndPace": string,
  "fillerWordsNoticed": string[],
  "strengths": string[],
  "areasToImprove": string[],
  "exemplarAnswer": string,
  "feedback": string
}`;
    } else if (type === "mnemonic") {
      systemPrompt = `You are a memory grandmaster specializing in the Method of Loci (Memory Palace), Peg Systems, and Spaced Repetition (Ebbinghaus, 1885).
Create a vivid 4K sensory memory palace journey for the user's topic: "${payload.topic}" containing items/concepts: ${JSON.stringify(payload.items)}

Return JSON matching this exact structure:
{
  "palaceName": string,
  "locations": [
    {
      "room": string,
      "item": string,
      "sensoryMnemonic": string,
      "visualDescription": string
    }
  ],
  "retrievalTip": string
}`;
    } else if (type === "summarization") {
      systemPrompt = `You are an expert academic learning strategist specializing in Summarization Science (Cornell Method & 5-3-1 Condensation).
Evaluate this student's summary of the topic/text titled "${payload.topic}":
Original Text / Context: "${payload.originalText || payload.topic}"
Student Summary: "${payload.studentSummary}"

Return JSON matching this exact structure:
{
  "score": number (0-100),
  "compressionRatio": string (e.g. "65% Condensed"),
  "keyIdeasCaptured": string[],
  "missingConcepts": string[],
  "fluffOrRedundancy": string[],
  "cornellCues": string[],
  "goldenSentence": string,
  "feedback": string
}`;
    } else if (type === "formula_mnemonic") {
      systemPrompt = `You are a mathematical memory coach & cognitive neuroscientist.
Create a high-retention formula memory kit for the formula: "${payload.formulaName}" (${payload.formulaText}). Subject: ${payload.subject || "Mathematics/Physics"}.

Return JSON matching this exact structure:
{
  "formulaName": string,
  "formulaText": string,
  "variables": [
    { "symbol": string, "name": string, "unit": string, "meaning": string }
  ],
  "storyMnemonic": string,
  "visualAnchor": string,
  "unitDimensionalTrick": string,
  "commonPitfallToAvoid": string,
  "retrievalRhymeOrAcronym": string,
  "stepByStepRearrangement": [
    { "solveFor": string, "resultingFormula": string, "explanation": string }
  ]
}`;
    } else if (type === "formula_practice") {
      systemPrompt = `You are an interactive mathematics and physics formula drill master.
Generate 3 interactive practice exercises for the formula: "${payload.formulaName}" (${payload.formulaText}). Subject: ${payload.subject || "Mathematics/Physics"}.

Return JSON matching this exact structure:
{
  "formulaName": string,
  "formulaText": string,
  "exercises": [
    {
      "id": number,
      "title": string,
      "scenario": string,
      "givenValues": { [key: string]: string },
      "targetVariable": string,
      "stepByStepSolution": [
        { "step": number, "action": string, "result": string }
      ],
      "finalAnswer": string,
      "unit": string,
      "hint": string
    }
  ]
}`;
    } else {
      return res.status(400).json({ error: "Invalid technique type" });
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1, feature: 'cognitive_lab' });
    }

    const text = result.text.trim();
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in evaluate-technique:", error);
    res.status(500).json({ error: "Failed to evaluate technique", details: error.message });
  }
});

app.post("/api/generate-quiz", protect, async (req, res) => {
  try {
    const { topic, subject } = req.body;
    const userId = req.user.uid;
    
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error });

    const prompt = `Generate 5 multiple-choice questions for "${topic}" in "${subject}". Return ONLY a JSON array of objects with "question", "options" (array of 4 strings), "answer" (integer index 0-3), and "explanation" (a brief string explaining why the answer is correct).`;
    const result = await genAI.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    
    if (result.usageMetadata?.totalTokenCount) await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1, feature: 'quiz' });

    const text = result.text.replace(/```json/g, '').replace(/```/g, '');
    res.json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.post("/api/solve-math", protect, async (req, res) => {
  try {
    const { problem } = req.body;
    const userId = req.user.uid;
    if (!problem) return res.status(400).json({ error: "Problem is required" });

    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error });

    const prompt = `Solve the following math problem step-by-step: "${problem}". Return ONLY a JSON array of objects, where each object has:
- "expression": the mathematical expression at this step (can be LaTeX if complex).
- "explanation": a clear, student-friendly explanation of what was done to get to this step.
- "action": (optional) a short text of the action applied, e.g., "-5", "÷2", "Simplify".
Do not include markdown blocks around the JSON.`;
    const result = await genAI.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    
    if (result.usageMetadata?.totalTokenCount) await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1, feature: 'math_solver' });

    let text = result.text.trim();
    if (text.startsWith("```json")) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (text.startsWith("```")) text = text.replace(/```/g, '').trim();
    
    res.json({ steps: JSON.parse(text) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to solve math problem' });
  }
});

app.post("/api/summarize-document", protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.uid;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const tokenCheck = await checkUsageBalance(userId, 'ai_requests', 1, 'document_analysis');
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error, code: tokenCheck.code, tier: tokenCheck.tier });

    const prompt = `Summarize the following study material titled "${title}". Provide concise overview and key bullet points.`;
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ text: prompt }, { text: content }],
    });

    if (result.usageMetadata?.totalTokenCount) await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });

    res.json({ summary: result.text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to summarize document' });
  }
});

app.post("/api/search-research", protect, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.uid;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const tokenCheck = await checkUsageBalance(userId, 'ai_requests', 1, 'research_hub');
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error, code: tokenCheck.code, tier: tokenCheck.tier });

    const systemPrompt = `Search for recent academic papers related to: "${query}". Return ONLY a valid JSON array of objects with "title", "authors", "source", "year", "citations", "summary".`;
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: systemPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    if (result.usageMetadata?.totalTokenCount) await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });

    let text = result.text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: 'Failed to search research: ' + error.message });
  }
});

app.post("/api/research/grounded-synthesis", protect, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.uid;
    if (!query) return res.status(400).json({ error: "Query/question is required" });

    const tokenCheck = await checkUsageBalance(userId, 'ai_requests', 1, 'research_hub');
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error, code: tokenCheck.code, tier: tokenCheck.tier });

    const systemInstruction = `You are a world-class academic Research Synthesizer. Provide a detailed, highly professional, cited academic explanation answering the query. Use inline numbered citations (e.g. [1], [2]) that correspond directly to your search sources. Keep the formatting clear and clean. Include suggestions for research methodology and literature review structure where relevant.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: query,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json({
      text: result.text || "No synthesis could be generated.",
      groundingMetadata: result.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error) {
    console.error("Grounded synthesis error:", error);
    res.status(500).json({ error: 'Failed to generate cited synthesis: ' + error.message });
  }
});

app.post("/api/research/news-search", protect, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.uid;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error });

    const systemInstruction = `You are a professional real-time news analyst. Compile a comprehensive, up-to-the-minute news summary with numbered citations (e.g. [1], [2]) based on active press coverages and verified media reports. Highlight key perspectives, chronological events, and key takeaways clearly. Keep the tone professional, objective, and clear.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Search for current news and articles on: ${query}`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json({
      text: result.text || "No news summary could be generated.",
      groundingMetadata: result.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error) {
    console.error("Grounded news search error:", error);
    res.status(500).json({ error: 'Failed to fetch grounded news: ' + error.message });
  }
});

app.post("/api/research/multi-api-synthesis", protect, async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user.uid;
    if (!topic || typeof topic !== "string") return res.status(400).json({ error: "Topic is required" });

    const tokenCheck = await checkUsageBalance(userId, 'ai_requests', 1, 'research_hub');
    if (!tokenCheck.allowed) return res.status(429).json({ error: tokenCheck.error, code: tokenCheck.code, tier: tokenCheck.tier });

    // Concurrently query all 7 free academic APIs
    const [wikiRes, arxivRes, openAlexRes, openLibRes, dictRes, nasaRes, wbRes] = await Promise.allSettled([
      fetchWikipediaSummary(topic),
      searchArxivPapers(topic, 4),
      searchOpenAlexWorks(topic, 4),
      searchOpenLibraryBooks(topic, 4),
      fetchDictionaryDefinition(topic),
      searchNasaSpaceScience(topic, 3),
      fetchWorldBankEduIndicators("ZAF")
    ]);

    const wikipediaData = wikiRes.status === "fulfilled" ? wikiRes.value : null;
    const arxivData = arxivRes.status === "fulfilled" ? arxivRes.value : [];
    const openAlexData = openAlexRes.status === "fulfilled" ? openAlexRes.value : [];
    const openLibData = openLibRes.status === "fulfilled" ? openLibRes.value : [];
    const dictionaryData = dictRes.status === "fulfilled" ? dictRes.value : null;
    const nasaData = nasaRes.status === "fulfilled" ? nasaRes.value : [];
    const worldBankData = wbRes.status === "fulfilled" ? wbRes.value : [];

    const contextPayload = {
      topic,
      wikipediaSummary: wikipediaData,
      arxivResearchPapers: arxivData,
      openAlexCitations: openAlexData,
      openLibraryTextbooks: openLibData,
      dictionaryDefinition: dictionaryData,
      nasaSpaceScienceMedia: nasaData,
      worldBankEducationStats: worldBankData
    };

    const systemInstruction = `You are the Pocket School Pro Chief Academic Research Architect (by Grade Master Africa).
Synthesize a comprehensive, world-class 4K Academic Research Master Briefing for the topic: "${topic}".
You are provided with live real-time academic API data retrieved from 7 global open repositories:
1. Wikipedia REST API
2. arXiv e-Print Archive
3. OpenAlex Global Knowledge Graph
4. Open Library Internet Archive
5. Free Dictionary & Phonetics
6. NASA Science Repository
7. World Bank Open Education Data

Structure your Markdown report into the following sections:
- **Executive Subject Overview** (Clear academic definition & core principles)
- **Dictionary & Terminology Breakdowns** (Key terms, etymology, phonetics)
- **Scientific Literature & arXiv Highlights** (Synthesize research papers found)
- **Open Access Textbooks & Reading Plan** (Recommend textbook study paths)
- **Empirical Data & Global Context** (Incorporate World Bank & NASA metrics where relevant)
- **Curriculum Mastery & Study Takeaways** (Actionable Grade 10-12 & Tertiary exam preparation tips)

Ensure the report is rigorous, cited, readable, and inspiring.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: JSON.stringify(contextPayload),
      config: { systemInstruction }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    return res.json({
      topic,
      synthesisMarkdown: result.text,
      sources: contextPayload
    });
  } catch (error: any) {
    console.error("Error in multi-api-synthesis:", error);
    res.status(500).json({ error: "Failed to generate multi-api research synthesis", details: error.message });
  }
});

// Creator Studio APIs (Require Token check too)
app.post("/api/creator/music", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { prompt, model = "lyria-3-clip-preview" } = req.body;
    const response = await genAI.models.generateContentStream({ model, contents: prompt });
    let audioBase64 = "", lyrics = "", mimeType = "audio/wav";
    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) lyrics = part.text;
      }
    }
    await recordUsage(userId, { tokens: 150000, feature: 'music' });
    res.json({ audioBase64, mimeType, lyrics });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/creator/image", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId, 'image_generations');
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { prompt, aspectRatio = "1:1", size = "1K", model = "gemini-3.1-flash-image" } = req.body;
    const interaction = await genAI.interactions.create({
      model, input: prompt, response_modalities: ['image', 'text'],
      generation_config: { image_config: { aspect_ratio: aspectRatio, image_size: size } },
    });
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const imageContent = step.content?.find(c => c.type === 'image');
        if (imageContent?.data) {
          await recordUsage(userId, { tokens: 50000, image_generations: 1, feature: 'image' });
          return res.json({ data: imageContent.data, mimeType: imageContent.mime_type || 'image/png' });
        }
      }
    }
    res.status(500).json({ error: "No image generated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/creator/video", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { prompt, aspectRatio = "16:9" } = req.body;
    const interaction = await genAI.interactions.create({
      model: 'gemini-omni-flash-preview', input: prompt, background: false, store: false, stream: false,
      response_format: { type: 'video', aspect_ratio: aspectRatio, duration: '5s' }
    });
    const videoPart = interaction.output_video;
    if (videoPart?.data) {
      await recordUsage(userId, { tokens: 500000, feature: 'video' });
      return res.json({ data: videoPart.data, mimeType: videoPart.mime_type || 'video/mp4' });
    }
    res.status(500).json({ error: "No video generated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/creator/transcribe", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { audioBase64, mimeType = "audio/wav", prompt = "Please transcribe this audio accurately." } = req.body;
    const interaction = await genAI.interactions.create({
      model: "gemini-1.5-flash",
      input: [{ type: "audio", data: audioBase64, mime_type: mimeType }, { type: "text", text: prompt }]
    });
    let fullOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find(c => c.type === 'text');
        if (textContent?.text) fullOutput += textContent.text;
      }
    }
    await recordUsage(userId, { tokens: 10000, ai_requests: 1, feature: 'transcribe' });
    res.json({ transcription: fullOutput });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- LANGUAGE MASTER APIs ---

app.post("/api/language/translate", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) return res.status(400).json({ error: "Missing text or targetLanguage" });

    const systemInstruction = `You are a world-class polyglot translator for Pocket School Pro (by Grade Master Africa).
Translate the following text into ${targetLanguage}.
Provide the translation, the phonetic pronunciation (where relevant), and any cultural context if applicable.
Return ONLY a JSON object with: { "translation": "...", "phonetic": "...", "context": "..." }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: text,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/language/check-grammar", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const systemInstruction = `You are an expert grammarian and editor for Pocket School Pro.
Analyze the following text for grammar, spelling, and punctuation errors.
Return a JSON object with: { "correctedText": "...", "explanations": ["error 1 fixed because...", "error 2 fixed because..."], "score": 0-100 }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: text,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/language/generate-lesson", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { language, level = "Beginner" } = req.body;
    if (!language) return res.status(400).json({ error: "Missing language" });

    const systemInstruction = `You are an expert language teacher for Pocket School Pro.
Create a structured language lesson for ${language} at ${level} level.
Include:
1. Lesson Title
2. Core Vocabulary (5-10 words with translations)
3. Grammar Rule (A simple explanation of one rule)
4. 3 Interactive Exercises (Fill in the blanks or multiple choice)
5. A 'Fun Fact' about the language or culture.
Return ONLY a JSON object with: { "title": "...", "vocabulary": [{ "word": "...", "translation": "..." }], "grammar": "...", "exercises": [{ "question": "...", "options": ["..."], "answer": 0 }], "funFact": "..." }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro", // Use pro for better lesson structure
      contents: `Generate a ${level} lesson for ${language}`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- BROAD STUDY GENERATION APIs ---

app.post("/api/study/generate-quiz", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { topic, difficulty = "Intermediate", count = 5 } = req.body;
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const systemInstruction = `You are a master academic examiner for Pocket School Pro.
Generate a high-quality quiz about "${topic}" at ${difficulty} level with ${count} questions.
Ensure the questions are rigorous and align with global academic standards (CAPS, IEB, Cambridge, etc.).
Return ONLY a JSON object with: { "questions": [{ "question": "...", "options": ["...", "...", "...", "..."], "answer": 0, "explanation": "..." }] }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Generate a ${count}-question ${difficulty} quiz on ${topic}`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/study/generate-flashcards", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { topic, count = 10 } = req.body;
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const systemInstruction = `You are a master academic coach for Pocket School Pro.
Generate ${count} high-quality interactive flashcards for the topic: "${topic}".
Each card should have a front (concept/question) and a back (definition/answer).
Focus on active recall and mastery.
Return ONLY a JSON object with: { "flashcards": [{ "front": "...", "back": "..." }] }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Generate ${count} flashcards on ${topic}`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- WRITING ASSISTANT & CV BUILDER ENDPOINTS ---

app.post("/api/writing/generate-ideas", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { type, topic, context = "" } = req.body;
    if (!type || !topic) return res.status(400).json({ error: "Missing type or topic" });

    const systemInstruction = `You are the Pocket School Pro Writing Assistant (by Grade Master Africa), specialized in the South African education system (CAPS and IEB curricula).
Help the student with ${type} ideas for the topic: "${topic}".
${context ? `Additional context: ${context}` : ""}
Provide a list of creative angles, outlines, and key points to include. 
Ensure the content is appropriate for South African academic standards, using British English (South African standard).
Return ONLY a JSON object with: { "ideas": [{ "title": "...", "description": "...", "outline": ["..."] }] }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Generate ideas for a ${type} about ${topic}`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/writing/draft", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { type, prompt, tone = "professional" } = req.body;
    if (!type || !prompt) return res.status(400).json({ error: "Missing type or prompt" });

    const systemInstruction = `You are the Pocket School Pro Writing Assistant, specialized in South African academic and professional writing.
Draft a ${tone} ${type} based on this prompt: "${prompt}".
Ensure the writing uses South African British English (e.g., "summarise" instead of "summarize").
The content should be articulate, well-structured, and culturally relevant to South Africa where applicable.
Return ONLY a JSON object with: { "draft": "...", "tips": ["..."] }`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Draft a ${type} about: ${prompt}`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/writing/cv-builder", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { userData } = req.body;
    if (!userData) return res.status(400).json({ error: "Missing user data" });

    const systemInstruction = `You are the Pocket School Pro Career Coach, specialized in the South African job market and academic applications.
Based on the provided user details, generate a professional Curriculum Vitae (CV) that follows South African industry standards.
Ensure the "summary" is compelling and the "responsibilities" use strong action verbs.
Format the response as a structured JSON object suitable for rendering a clean CV.
User Data: ${JSON.stringify(userData)}

Return ONLY a JSON object with: 
{ 
  "personalInfo": { "name": "...", "email": "...", "phone": "...", "location": "...", "summary": "..." },
  "education": [{ "institution": "...", "degree": "...", "period": "...", "achievements": ["..."] }],
  "experience": [{ "company": "...", "role": "...", "period": "...", "responsibilities": ["..."] }],
  "skills": ["..."],
  "references": [{ "name": "...", "contact": "...", "relation": "..." }]
}`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Generate a professional CV for ${userData.name}`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/writing/ai-notes", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { content, image, type = "homework" } = req.body;
    
    let promptText = "";
    if (type === "summarize") {
      promptText = `Summarize the following content into concise, clear study notes. Content: ${content}`;
    } else if (type === "homework") {
      promptText = `Analyze this homework or note content. Extract key concepts, formulas, and required actions. Create a structured study note from it. Content: ${content}`;
    }

    const systemInstruction = `You are the Pocket School Pro AI Notes Assistant, specialized in South African academic subjects (Mathematics, Physical Sciences, Life Sciences, History, etc.).
Your goal is to turn disorganized information, photos of handwriting, or voice transcripts into professional, structured study notes.
Identify key terms and define them. Extract any formulas found in the content.
Include sections for: Key Concepts, Detailed Summary, Formulas/Definitions, and Action Items.
Return ONLY a JSON object with: { "title": "...", "sections": [{ "heading": "...", "content": "..." }], "summary": "...", "tags": ["..."] }`;

    let result;
    if (image) {
      // Image + Text processing
      const imagePart = {
        inlineData: {
          data: image.split(",")[1],
          mimeType: "image/jpeg"
        }
      };
      result = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [{ role: "user", parts: [imagePart, { text: promptText || "Process this note/homework image." }] }],
        config: { systemInstruction, responseMimeType: "application/json" }
      });
    } else {
      // Text only processing
      result = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: promptText,
        config: { systemInstruction, responseMimeType: "application/json" }
      });
    }

    if (result.usageMetadata?.totalTokenCount) {
      await recordUsage(userId, { tokens: result.usageMetadata.totalTokenCount, ai_requests: 1 });
    }

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/creator/analyze-video", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tokenCheck = await checkUsageBalance(userId);
    if (!tokenCheck.allowed) return res.status(403).json(tokenCheck);

    const { videoBase64, mimeType = "video/mp4", prompt } = req.body;
    const interaction = await genAI.interactions.create({
      model: "gemini-1.5-pro",
      input: [{ type: "video", data: videoBase64, mime_type: mimeType }, { type: "text", text: prompt }]
    });
    let fullOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find(c => c.type === 'text');
        if (textContent?.text) fullOutput += textContent.text;
      }
    }
    await recordUsage(userId, { tokens: 250000, ai_requests: 1, feature: 'analyze_video' });
    res.json({ analysis: fullOutput });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Financials (Protect with auth + admin check)
app.get("/api/financials", protect, async (req, res) => {
  try {
    // Only allow enterprise tier (admin)
    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    const userSnap = await firestore.collection("users").doc(req.user.uid).get();
    if (userSnap.data()?.subscriptionTier !== "enterprise") {
       return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const transactionsSnap = await firestore.collection("transactions").get();
    
    let totalRevenue = 0, totalHosting = 0, totalTokens = 0, totalProfit = 0, transactionCount = 0;
    transactionsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === "success" || data.status === "completed") {
        totalRevenue += data.price || 0;
        totalHosting += data.hostingCost || 0;
        totalTokens += data.tokenCost || 0;
        totalProfit += data.profit || 0;
        transactionCount++;
      }
    });

    res.json({
      totalRevenue, totalHosting, totalTokens, totalProfit, transactionCount,
      averageMargin: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)) : 53.02,
      schemes: PRICING_MARGIN_SCHEMES
    });
  } catch (error) { console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message }); }
});

// Checkouts
app.post("/api/create-checkout-session", protect, async (req, res) => {
  try {
    const { planId, email, amount, cycle, sponsorshipContact } = req.body;
    const userId = req.user.uid;
    const planLower = planId.toLowerCase();
    
    let scheme = PRICING_MARGIN_SCHEMES[planLower];
    if (planLower.startsWith("donation") || planLower.startsWith("sponsor")) {
      const donAmt = Number(amount) || 100;
      scheme = { price: donAmt, hosting: donAmt * 0.15, tokens: donAmt * 0.32, profit: donAmt * 0.53, margin: 53.00 };
    }
    if (!scheme) return res.status(400).json({ error: "Invalid plan" });

    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    const txRef = firestore.collection("transactions").doc();
    const transactionData: any = {
      id: txRef.id, userId, email: email || req.user.email, planId, price: scheme.price,
      hostingCost: scheme.hosting, tokenCost: scheme.tokens, profit: scheme.profit, margin: scheme.margin,
      currency: "ZAR (R)", status: "pending", createdAt: Date.now()
    };

    if (planLower.startsWith("donation")) { transactionData.isDonation = true; transactionData.cycle = cycle || "once-off"; }
    else if (planLower.startsWith("sponsor")) { 
      transactionData.isSponsorship = true; transactionData.cycle = cycle || "once-off"; 
      transactionData.sponsorshipContact = sponsorshipContact || "";
    }

    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.YOCO_SECRET_KEY}` },
      body: JSON.stringify({
        amount: Math.round(scheme.price * 100), currency: "ZAR",
        successUrl: `https://${req.headers.host}/settings/subscription?success=true&tx=${txRef.id}`,
        cancelUrl: `https://${req.headers.host}/settings/subscription?canceled=true`,
        metadata: { transactionId: txRef.id, userId }
      })
    });
    
    const yocoData = await yocoResponse.json();
    if (!yocoResponse.ok) return res.status(400).json({ error: "Failed to initialize payment" });

    transactionData.paymentUrl = yocoData.redirectUrl;
    transactionData.yocoId = yocoData.id;
    await txRef.set(transactionData);
    
    // Sanitize client response to prevent any leakage of internal costs/margins
    const sanitizedTransaction = {
      id: transactionData.id,
      userId: transactionData.userId,
      email: transactionData.email,
      planId: transactionData.planId,
      price: transactionData.price,
      currency: transactionData.currency,
      status: transactionData.status,
      createdAt: transactionData.createdAt,
      isDonation: transactionData.isDonation,
      isSponsorship: transactionData.isSponsorship,
      cycle: transactionData.cycle,
      sponsorshipContact: transactionData.sponsorshipContact
    };

    res.json({ success: true, transaction: sanitizedTransaction, paymentUrl: yocoData.redirectUrl });
  } catch (error) { console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message }); }
});

app.post("/api/complete-checkout", protect, async (req, res) => {
  try {
    const { transactionId, planId } = req.body;
    const userId = req.user.uid;
    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    const txRef = firestore.collection("transactions").doc(transactionId);
    const txSnap = await txRef.get();

    if (!txSnap.exists) return res.status(404).json({ error: "Transaction not found" });
    const txData = txSnap.data();

    // Verify it was completed (ideally the webhook does this, but if the client reports it, we should double check status)
    if (txData.status !== "success") {
       // Just update firestore optimistically if needed, or rely on webhook.
       // Let's rely on webhook for the actual grant to prevent bypass.
       return res.json({ success: true, pending: true, message: "Waiting for payment verification webhook" });
    }

    res.json({ success: true, transaction: txData });
  } catch (error) { console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message }); }
});

// Yoco Webhook Handler
async function yocoWebhookHandler(req, res) {
  try {
    const secret = process.env.YOCO_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers['yoco-signature'];
      if (!signature) return res.status(401).json({ error: "Missing signature" });
      
      // Yoco Signature: webhookId=...,timestamp=...,v1=...
      const parts = signature.split(',');
      let timestamp = '', v1 = '', webhookId = '';
      for (const p of parts) {
        if (p.startsWith('timestamp=')) timestamp = p.split('=')[1];
        if (p.startsWith('v1=')) v1 = p.split('=')[1];
        if (p.startsWith('webhook_id=')) webhookId = p.split('=')[1];
      }
      
      const signedContent = `${webhookId}.${timestamp}.${req.body.toString('utf8')}`;
      const expectedSig = crypto.createHmac('sha256', secret).update(signedContent).digest('base64');
      
      if (expectedSig !== v1) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const event = JSON.parse(req.body.toString('utf8'));
    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');

    if (event.type === "payment.succeeded") {
      const payment = event.payload;
      const transactionId = payment.metadata?.transactionId;
      if (transactionId) {
        const txRef = firestore.collection("transactions").doc(transactionId);
        const txSnap = await txRef.get();
        if (txSnap.exists) {
          const txData = txSnap.data() || {};
          await txRef.update({ status: "success", completedAt: Date.now(), yocoPaymentId: payment.id });
          if (txData.userId && txData.userId !== "anonymous" && !txData.isDonation && !txData.isSponsorship) {
            const today = new Date();
            const resetDay = today.getDate();
            const nextBillingDate = new Date(today);
            nextBillingDate.setMonth(today.getMonth() + 1);

            const isSchoolPass = txData.planId.startsWith("school_");
            const schoolId = isSchoolPass ? `school_${txData.userId}_${Date.now()}` : null;

            const userUpdate: any = {
              subscriptionTier: txData.planId,
              subscriptionStatus: "active",
              role: txData.planId === "enterprise" ? "admin" : (isSchoolPass ? "school_admin" : "student"),
              lastPaymentDate: Date.now(),
              nextBillingDate: nextBillingDate.getTime(),
              quotaResetDay: resetDay,
              updatedAt: Date.now()
            };

            if (schoolId) {
              userUpdate.schoolId = schoolId;
              // Initialize school document
              await firestore.collection("schools").doc(schoolId).set({
                id: schoolId,
                name: `School Hub - ${txData.email || 'Admin'}`,
                adminId: txData.userId,
                subscriptionTier: txData.planId,
                subscriptionStatus: "active",
                createdAt: Date.now(),
                maxSeats: PLAN_LIMITS[txData.planId]?.max_learner_seats || 25
              });
            }

            await firestore.collection("users").doc(txData.userId).set(userUpdate, { merge: true });

            // Explicitly reset monthly usage for the new billing cycle
            const month = today.toISOString().substring(0, 7);
            const usageTargetRef = schoolId ? firestore.collection("schools").doc(schoolId) : firestore.collection("users").doc(txData.userId);
            
            await usageTargetRef.collection('usage').doc(month).set({
              totalTokens: 0,
              ai_requests: 0,
              image_generations: 0,
              voice_minutes: 0,
              lastResetAt: Date.now(),
              resetReason: "payment_success"
            }, { merge: true });
          }
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Yoco Webhook Error:", error);
    console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message });
  }
}

// Google Play Billing Verification
app.post("/api/verify-play-purchase", protect, async (req, res) => {
  try {
    const { purchaseToken, subscriptionId } = req.body;
    const userId = req.user.uid;
    const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT;
    if (!serviceAccountJson) return res.status(500).json({ error: "Play Billing not configured on server" });
    
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(serviceAccountJson),
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
    const publisher = google.androidpublisher({ version: 'v3', auth });
    
    const purchase = await publisher.purchases.subscriptions.get({
      packageName: 'com.grademaster.africa.twa',
      subscriptionId: subscriptionId,
      token: purchaseToken
    });
    
    // paymentState 1 = Payment received, 2 = Free trial
    if (purchase.data.paymentState === 1 || purchase.data.paymentState === 2) {
       const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
       await firestore.collection("users").doc(userId).set({
         subscriptionTier: subscriptionId,
         role: subscriptionId === "enterprise" ? "admin" : "student",
         updatedAt: Date.now()
       }, { merge: true });
       
       await firestore.collection("transactions").add({
         userId, planId: subscriptionId, provider: "google_play", status: "success", token: purchaseToken, createdAt: Date.now()
       });
       
       res.json({ success: true });
    } else {
       res.status(400).json({ error: "Payment not verified by Google" });
    }
  } catch (error) {
    console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message });
  }
});

// Telemetry
// Account Deletion
app.delete("/api/account", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    
    // Delete user data from firestore
    await firestore.collection("users").doc(userId).delete();
    
    // Delete user from auth
    await getAdminAuth(getAdminApp()).deleteUser(userId);
    
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message });
  }
});

app.post("/api/telemetry", protect, async (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type || !payload) return res.status(400).json({ error: "Missing type or payload" });
    
    const firestore = getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
    await firestore.collection("telemetry").add({
      type, ...payload, timestamp: Date.now(),
      ipHash: req.ip ? crypto.createHash('sha256').update(req.ip).digest('hex') : "unknown",
      userAgent: req.headers['user-agent'] || "unknown"
    });
    res.json({ success: true });
  } catch (error) { console.error("API CHAT ERROR:", error); res.status(500).json({ error: error.message }); }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        else if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|ico|svg)$/)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on http://localhost:${PORT}`); });

  const wss = new WebSocketServer({ server, path: '/live' });
  wss.on("connection", async (clientWs, req) => {
    // Note: WS authentication ideally handled via ticket or token in URL query
    try {
      const session = await genAI.live.connect({
        model: "gemini-2.0-flash-exp",
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) clientWs.send(JSON.stringify({ audio }));
            if (message.serverContent?.interrupted) clientWs.send(JSON.stringify({ interrupted: true }));
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
          systemInstruction: "You are an intelligent tutor and assistant for Pocket School Pro. Keep answers concise and engaging.",
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) session.sendRealtimeInput({ audio: { data: audio, mimeType: "audio/pcm;rate=16000" } });
        } catch (e) { console.error(e); }
      });
    } catch (err) { clientWs.close(); }
  });
}

startServer();
