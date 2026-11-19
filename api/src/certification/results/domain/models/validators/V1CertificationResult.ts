import { z } from 'zod';

import { AlgorithmEngineVersion } from '../../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../shared/domain/models/Frameworks.js';
import { BaseCoreResultsSchema, BaseSchema } from './CertificationResult.ts';

const V1CoreSchema = BaseSchema.extend({
  algorithmEngineVersion: z.literal(AlgorithmEngineVersion.V1),
  framework: z.literal(Frameworks.CORE),
  results: BaseCoreResultsSchema,
});

export const CertificationResultV1Schema = z.discriminatedUnion('framework', [V1CoreSchema]);
