import { z } from 'zod';

import { CERTIFICATION_RESULT_STATUSES } from './constants.ts';
import type { BaseCoreResultsSchema } from './models/validators/CertificationResult.ts';
import type {
  V2CleaResultsSchema,
  V2EduResultsSchema,
  V2PixPlusResultsSchema,
} from './models/validators/V2CertificationResult.ts';
import type {
  V3CleaResultsSchema,
  V3CoreResultsSchema,
  V3EduResultsSchema,
  V3PixPlusResultsSchema,
} from './models/validators/V3CertificationResult.ts';
export type CertificationResultStatus =
  (typeof CERTIFICATION_RESULT_STATUSES)[keyof typeof CERTIFICATION_RESULT_STATUSES];

export const CertificationResultStatusSchema = z.enum(Object.values(CERTIFICATION_RESULT_STATUSES));

type V1CoreResults = z.infer<typeof BaseCoreResultsSchema>;
type V2CoreResults = z.infer<typeof BaseCoreResultsSchema>;
type V2CleaResults = z.infer<typeof V2CleaResultsSchema>;
type V2PixPlusResults = z.infer<typeof V2PixPlusResultsSchema>;
type V2EduResults = z.infer<typeof V2EduResultsSchema>;
type V3CoreResults = z.infer<typeof V3CoreResultsSchema>;
type V3CleaResults = z.infer<typeof V3CleaResultsSchema>;
type V3PixPlusResults = z.infer<typeof V3PixPlusResultsSchema>;
type V3EduResults = z.infer<typeof V3EduResultsSchema>;

export type V1Results = V1CoreResults;
export type V2Results = V2CoreResults | V2CleaResults | V2PixPlusResults | V2EduResults;
export type V3Results = V3CoreResults | V3CleaResults | V3PixPlusResults | V3EduResults;
export type Results = V1Results | V2Results | V3Results;
