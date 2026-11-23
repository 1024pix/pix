import { z } from 'zod';

import { CERTIFICATION_RESULT_STATUSES } from './constants.ts';
export type CertificationResultStatus =
  (typeof CERTIFICATION_RESULT_STATUSES)[keyof typeof CERTIFICATION_RESULT_STATUSES];

export const CertificationResultStatusSchema = z.enum(Object.values(CERTIFICATION_RESULT_STATUSES));
