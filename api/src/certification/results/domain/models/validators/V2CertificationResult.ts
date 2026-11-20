import { z } from 'zod';

import { AlgorithmEngineVersion } from '../../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../shared/domain/models/Frameworks.js';
import { BaseCleaResultsSchema, BaseCoreResultsSchema, BaseSchema } from './CertificationResult.ts';

export const V2CleaResultsSchema = BaseCoreResultsSchema.extend(BaseCleaResultsSchema.shape);

export const V2PixPlusResultsSchema = BaseCoreResultsSchema.extend({
  v2VoletPixBadgeId: z.number(),
  v2VoletPixAcquired: z.boolean(),
});

export const V2EduResultsSchema = V2PixPlusResultsSchema.extend({
  v2VoletExterneBadgeId: z.number(),
  v2VoletExterneAcquired: z.boolean(),
});

const V2BaseSchema = BaseSchema.extend({
  algorithmEngineVersion: z.literal(AlgorithmEngineVersion.V2),
  middleName: z.string().nullable(),
  thirdName: z.string().nullable(),
  nationalStudentId: z.string().nullable(),
  birthPostalCode: z.string().nullable(),
  birthINSEECode: z.string().nullable(),
  birthCountry: z.string().nullable(),
  franceCompetencesMinScore: z.number().nullable(),
  commentByAutoJury: z.string().nullable(),
});

const V2CoreSchema = V2BaseSchema.extend({
  framework: z.literal(Frameworks.CORE),
  results: BaseCoreResultsSchema,
});

const V2CleaSchema = V2BaseSchema.extend({
  framework: z.literal(Frameworks.CLEA),
  results: V2CleaResultsSchema,
});

const V2DroitProSanteSchema = V2BaseSchema.extend({
  framework: z.enum([Frameworks.DROIT, Frameworks.PRO_SANTE]),
  results: V2PixPlusResultsSchema,
});

const V2EduSchema = V2BaseSchema.extend({
  framework: z.enum([Frameworks.EDU_2ND_DEGRE, Frameworks.EDU_CPE, Frameworks.EDU_1ER_DEGRE]),
  results: V2EduResultsSchema,
});

export const CertificationResultV2Schema = z.discriminatedUnion('framework', [
  V2CoreSchema,
  V2CleaSchema,
  V2DroitProSanteSchema,
  V2EduSchema,
]);
