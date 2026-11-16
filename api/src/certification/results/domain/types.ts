import type { CERTIFICATION_RESULT_STATUSES } from './constants.ts';
export type CertificationResultStatus =
  (typeof CERTIFICATION_RESULT_STATUSES)[keyof typeof CERTIFICATION_RESULT_STATUSES];
