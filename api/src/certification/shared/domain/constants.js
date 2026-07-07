export const UNCERTIFIED_LEVEL = -1;

export const SESSION_STATUSES = Object.freeze({
  CREATED: 'created',
  FINALIZED: 'finalized',
  IN_PROCESS: 'in_process',
  PROCESSED: 'processed',
});

export const BILLING_MODES = Object.freeze({
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
});

export const SUBSCRIPTION_TYPES = Object.freeze({
  CORE: 'CORE',
  COMPLEMENTARY: 'COMPLEMENTARY',
});

export const DEFAULT_PROBABILITY_TO_PICK_CHALLENGE = 51;
export const DEFAULT_SESSION_DURATION_MINUTES = 105;
export const DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION = 20;
export const MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED = 50;
