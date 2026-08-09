export interface PlanLimits {
  tokens_per_month: number;
  ai_requests_per_day: number;
  vision_requests_per_day: number;
  voice_minutes_per_day: number;
  mcp_allowed: boolean;
  advanced_models: boolean;
  image_generations_per_day: number;
  tutor_sessions_per_day: number;
  max_learner_seats?: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    tokens_per_month: 30_000,
    ai_requests_per_day: 10,
    vision_requests_per_day: 3,
    voice_minutes_per_day: 0,
    mcp_allowed: false,
    advanced_models: false,
    image_generations_per_day: 0,
    tutor_sessions_per_day: 3,
    max_learner_seats: 1
  },
  trial: {
    tokens_per_month: 50_000,
    ai_requests_per_day: 20,
    vision_requests_per_day: 10,
    voice_minutes_per_day: 10,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 2,
    tutor_sessions_per_day: 5,
    max_learner_seats: 1
  },
  basic_49: {
    tokens_per_month: 150_000,
    ai_requests_per_day: 30,
    vision_requests_per_day: 10,
    voice_minutes_per_day: 15,
    mcp_allowed: true,
    advanced_models: false,
    image_generations_per_day: 3,
    tutor_sessions_per_day: 10,
    max_learner_seats: 1
  },
  plus_69: {
    tokens_per_month: 350_000,
    ai_requests_per_day: 75,
    vision_requests_per_day: 25,
    voice_minutes_per_day: 30,
    mcp_allowed: true,
    advanced_models: false,
    image_generations_per_day: 8,
    tutor_sessions_per_day: 20,
    max_learner_seats: 1
  },
  standard_99: {
    tokens_per_month: 750_000,
    ai_requests_per_day: 150,
    vision_requests_per_day: 50,
    voice_minutes_per_day: 45,
    mcp_allowed: true,
    advanced_models: false,
    image_generations_per_day: 15,
    tutor_sessions_per_day: -1,
    max_learner_seats: 1
  },
  gold_199: {
    tokens_per_month: 2_500_000,
    ai_requests_per_day: 300,
    vision_requests_per_day: 100,
    voice_minutes_per_day: 90,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 30,
    tutor_sessions_per_day: -1,
    max_learner_seats: 1
  },
  // Legacy aliases for backwards compatibility
  basic: {
    tokens_per_month: 150_000,
    ai_requests_per_day: 30,
    vision_requests_per_day: 10,
    voice_minutes_per_day: 15,
    mcp_allowed: true,
    advanced_models: false,
    image_generations_per_day: 3,
    tutor_sessions_per_day: 10,
    max_learner_seats: 1
  },
  standard: {
    tokens_per_month: 750_000,
    ai_requests_per_day: 150,
    vision_requests_per_day: 50,
    voice_minutes_per_day: 45,
    mcp_allowed: true,
    advanced_models: false,
    image_generations_per_day: 15,
    tutor_sessions_per_day: -1,
    max_learner_seats: 1
  },
  premium: {
    tokens_per_month: 2_500_000,
    ai_requests_per_day: 300,
    vision_requests_per_day: 100,
    voice_minutes_per_day: 90,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 30,
    tutor_sessions_per_day: -1,
    max_learner_seats: 1
  },
  // School Multi-Learner Base Passes
  school_25: {
    tokens_per_month: 10_000_000,
    ai_requests_per_day: 1_500,
    vision_requests_per_day: 500,
    voice_minutes_per_day: 300,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 100,
    tutor_sessions_per_day: -1,
    max_learner_seats: 25
  },
  school_100: {
    tokens_per_month: 35_000_000,
    ai_requests_per_day: 5_000,
    vision_requests_per_day: 1_800,
    voice_minutes_per_day: 1_200,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 350,
    tutor_sessions_per_day: -1,
    max_learner_seats: 100
  },
  school_300: {
    tokens_per_month: 90_000_000,
    ai_requests_per_day: 15_000,
    vision_requests_per_day: 5_000,
    voice_minutes_per_day: 3_500,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 1_000,
    tutor_sessions_per_day: -1,
    max_learner_seats: 300
  },
  school_1000: {
    tokens_per_month: 250_000_000,
    ai_requests_per_day: 50_000,
    vision_requests_per_day: 15_000,
    voice_minutes_per_day: 10_000,
    mcp_allowed: true,
    advanced_models: true,
    image_generations_per_day: 3_000,
    tutor_sessions_per_day: -1,
    max_learner_seats: 1000
  }
};

/**
 * INTERNAL BUSINESS LOGIC - DO NOT EXPOSE TO UI
 * Hardcoded 53% target profit margin for all subscription unit economics.
 * This is used to calculate token caps and monthly quotas relative to API costs.
 */
const TARGET_PROFIT_MARGIN = 0.53;

/**
 * Calculates the maximum safe token limit for a plan given its price in ZAR
 * and the estimated cost per 1M tokens (e.g., $0.15 for Flash, $3.5 for Pro).
 * 
 * Formula: Price * (1 - TARGET_PROFIT_MARGIN) / (CostPerToken * ExchangeRate)
 */
export function calculateSafeTokenLimit(priceZar: number, costPerMillionUsd: number, exchangeRate: number = 18.5): number {
  const availableBudgetZar = priceZar * (1 - TARGET_PROFIT_MARGIN);
  const availableBudgetUsd = availableBudgetZar / exchangeRate;
  const maxTokens = (availableBudgetUsd / costPerMillionUsd) * 1_000_000;
  return Math.floor(maxTokens);
}


