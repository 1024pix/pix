import { z } from 'zod';

import { BaseCoreResultsSchema } from './validators/CertificationResult.ts';
import { V2CleaResultsSchema, V2EduResultsSchema, V2PixPlusResultsSchema } from './validators/V2CertificationResult.ts';
import {
  V3CleaResultsSchema,
  V3CoreResultsSchema,
  V3EduResultsSchema,
  V3PixPlusResultsSchema,
} from './validators/V3CertificationResult.ts';

type V1CoreResults = z.infer<typeof BaseCoreResultsSchema>;
type V2CoreResults = z.infer<typeof BaseCoreResultsSchema>;
type V2CleaResults = z.infer<typeof V2CleaResultsSchema>;
type V2PixPlusResults = z.infer<typeof V2PixPlusResultsSchema>;
export type V2EduResults = z.infer<typeof V2EduResultsSchema>;
type V3CoreResults = z.infer<typeof V3CoreResultsSchema>;
type V3CleaResults = z.infer<typeof V3CleaResultsSchema>;
type V3PixPlusResults = z.infer<typeof V3PixPlusResultsSchema>;
type V3EduResults = z.infer<typeof V3EduResultsSchema>;

export type V1Results = V1CoreResults;
export type V2Results = V2CoreResults | V2CleaResults | V2PixPlusResults | V2EduResults;
export type V3Results = V3CoreResults | V3CleaResults | V3PixPlusResults | V3EduResults;
export type Results = V1Results | V2Results | V3Results;
