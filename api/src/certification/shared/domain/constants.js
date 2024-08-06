export const CERTIFICATION_FEATURES = Object.freeze({
  CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE: {
    key: 'CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE',
    description:
      "Permet l'accès pour un centre de certification à l'inscription d'un candidat passant une complémentaire seule.",
  },
});

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

export const DEFAULT_SESSION_DURATION_MINUTES = 105;
export const CURRENT_CERTIFICATION_VERSION = 2;
