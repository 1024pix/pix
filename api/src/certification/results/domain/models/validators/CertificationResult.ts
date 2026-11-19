import { z } from 'zod';

import { MAX_LEVEL } from '../../constants.ts';
import { CertificationResultStatusSchema } from '../../types.ts';

export const BaseSchema = z.strictObject({
  id: z.string().uuid(),
  algorithmEngineVersion: z.number(),
  firstName: z.string(),
  middleName: z.null(),
  thirdName: z.null(),
  lastName: z.string(),
  externalId: z.string().nullable(),
  nationalStudentId: z.null(),
  birthdate: z.string(),
  birthplace: z.string(),
  birthPostalCode: z.null(),
  birthINSEECode: z.null(),
  birthCountry: z.null(),
  verificationCode: z.string(),
  certificationCenter: z.string(),
  startedAt: z.date(),
  deliveredAt: z.date(),
  status: CertificationResultStatusSchema,
  framework: z.string(),
  franceCompetencesMinScore: z.null(),
  commentByAutoJury: z.null(),
  commentByJury: z.string().nullable(),
  commentForOrganization: z.string().nullable(),
  commentForCandidate: z.string().nullable(),
});

export const CompetenceMarkSchema = z.strictObject({
  competenceId: z.string(),
  level: z.number().max(MAX_LEVEL),
});

export const BaseCoreResultsSchema = z.strictObject({
  pixScore: z.number().nullable(),
  competenceMarks: z.array(CompetenceMarkSchema),
});

export const BaseCleaResultsSchema = z.strictObject({
  hasAcquiredClea: z.boolean(),
  cleaBadgeId: z.number(),
});
