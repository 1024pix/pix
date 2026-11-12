import type { UUID } from 'node:crypto';

import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks, isEduFramework } from '../../../shared/domain/models/Frameworks.js';
import { FRANCE_COMPETENCES_PROFESSIONAL_START_DATE } from '../constants.js';
import { CertificationResult, type Results, UserCertificationResult } from './NewCertificationResult.ts';
const FRANCE_COMPETENCES_MIN_SCORE = 120;

export type CertificationDataV3Props = {
  certificationCourseId: number;
  userId: number;
  sessionId: number;
  organizationLearnerId: number | null;
  algorithmEngineVersion: number;
  firstName: string;
  lastName: string;
  externalId: string | null;
  birthdate: string;
  birthplace: string;
  birthPostalCode: string | null;
  birthINSEECode: string | null;
  birthCountry: string | null;
  verificationCode: string;
  certificationCenter: string;
  startedAt: Date;
  deliveredAt: Date;
  status: string;
  framework: string;
  maxReachableLevel: number;
  pixScore: number | null;
  reachedMeshIndex: number | null;
  eduV3ExternalJuryResult: string | null;
  commentByAutoJury: string | null;
  commentByJury: string | null;
  commentForOrganization: string | null;
  commentForCandidate: string | null;
  competenceMarks: Array<CompetenceMarkDataV3Props>;
};
type CompetenceMarkDataV3Props = {
  level: number;
  competenceId: string;
};
type LearnerDataV3Props = {
  organizationLearnerId: number;
  middleName: string | null;
  thirdName: string | null;
  nationalStudentId: string | null;
};
type CleaDataV3Props = {
  certificationCourseId: number;
  acquired: boolean;
  complementaryCertificationBadgeId: number;
};

export class CertificationResultBuilder {
  readonly certificationData: Array<CertificationDataV3Props>;
  readonly learnerData: Array<LearnerDataV3Props>;
  readonly cleaData: Array<CleaDataV3Props>;
  constructor({
    certificationData,
    learnerData,
    cleaData,
  }: {
    certificationData: Array<CertificationDataV3Props>;
    learnerData: Array<LearnerDataV3Props>;
    cleaData: Array<CleaDataV3Props>;
  }) {
    this.certificationData = certificationData;
    this.learnerData = learnerData;
    this.cleaData = cleaData;
  }

  build(uuidGenerator: () => UUID) {
    const errors: Record<number, string> = {};
    const certificationResults = [];
    const userCertificationResults = [];
    for (const certificationItem of this.certificationData) {
      if (certificationItem.algorithmEngineVersion !== AlgorithmEngineVersion.V3) {
        errors[certificationItem.certificationCourseId] =
          `AlgorithmEngineVersion ${certificationItem.algorithmEngineVersion} not implemented yet.`;
        continue;
      }
      const franceCompetencesMinScore = isRecognizedByFranceCompetences(
        certificationItem.deliveredAt,
        certificationItem.framework,
      )
        ? FRANCE_COMPETENCES_MIN_SCORE
        : null;
      const cleaItem =
        this.cleaData.find((item) => item.certificationCourseId === certificationItem.certificationCourseId) ?? null;
      const results = buildV3Results(certificationItem, cleaItem);
      const learnerItem =
        this.learnerData.find((item) => item.organizationLearnerId === certificationItem.organizationLearnerId) ?? null;
      const id = uuidGenerator();
      const certificationResult = new CertificationResult({
        id,
        algorithmEngineVersion: certificationItem.algorithmEngineVersion,
        firstName: certificationItem.firstName,
        middleName: learnerItem?.middleName ?? null,
        thirdName: learnerItem?.thirdName ?? null,
        lastName: certificationItem.lastName,
        externalId: certificationItem.externalId ?? null,
        nationalStudentId: learnerItem?.nationalStudentId ?? null,
        birthdate: certificationItem.birthdate,
        birthplace: certificationItem.birthplace,
        birthPostalCode: certificationItem.birthPostalCode ?? null,
        birthINSEECode: certificationItem.birthINSEECode ?? null,
        birthCountry: certificationItem.birthCountry ?? null,
        verificationCode: certificationItem.verificationCode,
        certificationCenter: certificationItem.certificationCenter,
        startedAt: certificationItem.startedAt,
        deliveredAt: certificationItem.deliveredAt,
        status: certificationItem.status,
        framework: certificationItem.framework,
        franceCompetencesMinScore,
        commentByAutoJury: certificationItem.commentByAutoJury,
        commentByJury: certificationItem.commentByJury,
        commentForOrganization: certificationItem.commentForOrganization,
        commentForCandidate: certificationItem.commentForCandidate,
        results,
      });
      certificationResults.push(certificationResult);
      userCertificationResults.push(
        new UserCertificationResult({
          certificationCourseId: certificationItem.certificationCourseId,
          sessionId: certificationItem.sessionId,
          userId: certificationItem.userId,
          certificationResultId: id,
        }),
      );
    }
    return {
      certificationResults,
      userCertificationResults,
      errors,
    };
  }
}

function buildV3Results(certificationData: CertificationDataV3Props, cleaData: CleaDataV3Props | null): Results {
  if (certificationData.framework === Frameworks.CORE) {
    return {
      maxReachableLevel: certificationData.maxReachableLevel,
      reachedMeshIndex: certificationData.reachedMeshIndex,
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
    };
  }
  if (isEduFramework(certificationData.framework)) {
    return {
      maxReachableLevel: certificationData.maxReachableLevel,
      reachedMeshIndex: certificationData.reachedMeshIndex,
      eduV3ExternalJuryResult: certificationData.eduV3ExternalJuryResult,
    };
  }
  if (certificationData.framework === Frameworks.CLEA) {
    return {
      maxReachableLevel: certificationData.maxReachableLevel,
      reachedMeshIndex: certificationData.reachedMeshIndex,
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
      acquired: cleaData!.acquired,
      complementaryCertificationBadgeId: cleaData!.complementaryCertificationBadgeId,
    };
  }
  return {
    maxReachableLevel: certificationData.maxReachableLevel,
    reachedMeshIndex: certificationData.reachedMeshIndex,
  };
}

function isRecognizedByFranceCompetences(deliveredAt: Date, framework: string) {
  // @ts-expect-error je sais pas
  if (![Frameworks.CORE, Frameworks.CLEA].includes(framework)) return;
  return deliveredAt.getTime() >= FRANCE_COMPETENCES_PROFESSIONAL_START_DATE.getTime();
}
