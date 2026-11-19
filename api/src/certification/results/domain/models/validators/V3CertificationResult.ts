import { z } from 'zod';

import { AlgorithmEngineVersion } from '../../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../shared/domain/models/Frameworks.js';
import { MAX_LEVEL } from '../../constants.ts';
import { BaseCleaResultsSchema, BaseCoreResultsSchema, BaseSchema } from './CertificationResult.ts';

export const V3CoreResultsSchema = BaseCoreResultsSchema.extend({
  maxReachableLevel: z.number().max(MAX_LEVEL),
  reachedMeshIndex: z.number().nullable(),
});

export const V3CleaResultsSchema = V3CoreResultsSchema.extend(BaseCleaResultsSchema.shape);

export const V3PixPlusResultsSchema = z.strictObject({
  maxReachableLevel: z.number(),
  reachedMeshIndex: z.number().nullable(),
});

export const V3EduResultsSchema = V3PixPlusResultsSchema.extend({
  v3EduExternalJuryResult: z.string().nullable(),
});

const V3BaseSchema = BaseSchema.extend({
  algorithmEngineVersion: z.literal(AlgorithmEngineVersion.V3),
  middleName: z.string().nullable(),
  thirdName: z.string().nullable(),
  nationalStudentId: z.string().nullable(),
  birthPostalCode: z.string().nullable(),
  birthINSEECode: z.string().nullable(),
  birthCountry: z.string().nullable(),
  franceCompetencesMinScore: z.number().nullable(),
  commentByAutoJury: z.string().nullable(),
});

const V3CoreSchema = V3BaseSchema.extend({
  framework: z.literal(Frameworks.CORE),
  results: V3CoreResultsSchema,
});

const V3CleaSchema = V3BaseSchema.extend({
  framework: z.literal(Frameworks.CLEA),
  results: V3CleaResultsSchema,
});

const V3DroitProSanteSchema = V3BaseSchema.extend({
  framework: z.enum([Frameworks.DROIT, Frameworks.PRO_SANTE]),
  franceCompetencesMinScore: z.null(),
  results: V3PixPlusResultsSchema,
});

const V3EduSchema = V3BaseSchema.extend({
  framework: z.enum([Frameworks.EDU_2ND_DEGRE, Frameworks.EDU_CPE, Frameworks.EDU_1ER_DEGRE]),
  franceCompetencesMinScore: z.null(),
  results: V3EduResultsSchema,
});

export const CertificationResultV3Schema = z.discriminatedUnion('framework', [
  V3CoreSchema,
  V3CleaSchema,
  V3DroitProSanteSchema,
  V3EduSchema,
]);
