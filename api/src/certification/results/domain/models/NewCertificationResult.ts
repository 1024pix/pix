import type { UUID } from 'node:crypto';

import { z } from 'zod';

import type { Framework } from '../../../shared/domain/types.ts';
import { type CertificationResultStatus, type Results } from '../types.ts';
import { CertificationResultV1Schema } from './validators/V1CertificationResult.ts';
import { CertificationResultV2Schema } from './validators/V2CertificationResult.ts';
import { CertificationResultV3Schema } from './validators/V3CertificationResult.ts';

export const CertificationResultSchema = z.discriminatedUnion('algorithmEngineVersion', [
  CertificationResultV1Schema,
  CertificationResultV2Schema,
  CertificationResultV3Schema,
]);

type CertificationResultProps = {
  id: UUID;
  algorithmEngineVersion: number;
  firstName: string;
  middleName: string | null;
  thirdName: string | null;
  lastName: string;
  externalId: string | null;
  nationalStudentId: string | null;
  birthdate: string;
  birthplace: string;
  birthPostalCode: string | null;
  birthINSEECode: string | null;
  birthCountry: string | null;
  verificationCode: string;
  certificationCenter: string;
  startedAt: Date;
  deliveredAt: Date;
  status: CertificationResultStatus;
  framework: Framework;
  franceCompetencesMinScore: number | null;
  commentByAutoJury: string | null;
  commentByJury: string | null;
  commentForOrganization: string | null;
  commentForCandidate: string | null;
  results: Results;
};
export class CertificationResult {
  readonly id: UUID;
  readonly algorithmEngineVersion: number;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly thirdName: string | null;
  readonly lastName: string;
  readonly externalId: string | null;
  readonly nationalStudentId: string | null;
  readonly birthdate: string;
  readonly birthplace: string;
  readonly birthPostalCode: string | null;
  readonly birthINSEECode: string | null;
  readonly birthCountry: string | null;
  readonly verificationCode: string;
  readonly certificationCenter: string;
  readonly startedAt: Date;
  readonly deliveredAt: Date;
  readonly status: CertificationResultStatus;
  readonly framework: Framework;
  readonly franceCompetencesMinScore: number | null;
  readonly commentByAutoJury: string | null;
  readonly commentByJury: string | null;
  readonly commentForOrganization: string | null;
  readonly commentForCandidate: string | null;
  readonly results: Results;

  constructor(props: CertificationResultProps) {
    this.id = props.id;
    this.algorithmEngineVersion = props.algorithmEngineVersion;
    this.firstName = props.firstName;
    this.middleName = props.middleName;
    this.thirdName = props.thirdName;
    this.lastName = props.lastName;
    this.externalId = props.externalId;
    this.nationalStudentId = props.nationalStudentId;
    this.birthdate = props.birthdate;
    this.birthplace = props.birthplace;
    this.birthPostalCode = props.birthPostalCode;
    this.birthINSEECode = props.birthINSEECode;
    this.birthCountry = props.birthCountry;
    this.verificationCode = props.verificationCode;
    this.certificationCenter = props.certificationCenter;
    this.startedAt = props.startedAt;
    this.deliveredAt = props.deliveredAt;
    this.status = props.status;
    this.framework = props.framework;
    this.franceCompetencesMinScore = props.franceCompetencesMinScore;
    this.commentByAutoJury = props.commentByAutoJury;
    this.commentByJury = props.commentByJury;
    this.commentForOrganization = props.commentForOrganization;
    this.commentForCandidate = props.commentForCandidate;
    this.results = props.results;
  }

  validate() {
    const { success, error } = CertificationResultSchema.safeParse(this);
    if (success) return null;
    return JSON.stringify(z.flattenError(error));
  }
}

type UserCertificationResultProps = {
  userId: number;
  certificationCourseId: number | null;
  sessionId: number | null;
  organizationLearnerId: number | null;
  certificationResultId: UUID;
};

export class UserCertificationResult {
  readonly userId: number;
  readonly certificationCourseId: number | null;
  readonly sessionId: number | null;
  readonly organizationLearnerId: number | null;
  readonly certificationResultId: UUID;

  constructor(props: UserCertificationResultProps) {
    this.userId = props.userId;
    this.certificationCourseId = props.certificationCourseId;
    this.sessionId = props.sessionId;
    this.certificationResultId = props.certificationResultId;
    this.organizationLearnerId = props.organizationLearnerId;
  }
}
