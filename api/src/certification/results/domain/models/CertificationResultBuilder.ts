import type { UUID } from 'node:crypto';

import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks, isEduFramework } from '../../../shared/domain/models/Frameworks.js';
import type { Framework } from '../../../shared/domain/types.ts';
import { FRANCE_COMPETENCES_PROFESSIONAL_START_DATE } from '../constants.ts';
import type { CertificationResultStatus } from '../types.ts';
import type { Results, V1Results, V2Results, V3Results } from './NewCertificationResult.schema.ts';
import { CertificationResult, UserCertificationResult } from './NewCertificationResult.ts';
const FRANCE_COMPETENCES_MIN_SCORE = 120;

export type CertificationDataProps = {
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
  certificationCenter: string | null;
  certificationCenterFallback: string;
  startedAt: Date;
  deliveredAt: Date;
  status: CertificationResultStatus;
  framework: Framework;
  maxReachableLevel: number;
  pixScore: number | null;
  reachedMeshIndex: number | null;
  v3EduExternalJuryResult: string | null;
  commentByAutoJury: string | null;
  commentByJury: string | null;
  commentForOrganization: string | null;
  commentForCandidate: string | null;
  competenceMarks: Array<CompetenceMarkDataProps>;
};
type CompetenceMarkDataProps = {
  level: number;
  competenceId: string;
};
type LearnerDataProps = {
  organizationLearnerId: number;
  middleName: string | null;
  thirdName: string | null;
  nationalStudentId: string | null;
};
type CleaDataProps = {
  certificationCourseId: number;
  cleaBadgeId: number;
  hasAcquiredClea: boolean;
};
type PixPlusV2VoletPixDataProps = {
  certificationCourseId: number;
  v2VoletPixBadgeId: number;
  v2VoletPixAcquired: boolean;
};
type PixPlusV2VoletExterneDataProps = {
  certificationCourseId: number;
  v2VoletExterneBadgeId: number;
  v2VoletExterneAcquired: boolean;
};
type FullCertificationData = {
  certificationItem: CertificationDataProps;
  learnerItem: LearnerDataProps | null;
  cleaItem: CleaDataProps | null;
  pixPlusV2VoletPixItem: PixPlusV2VoletPixDataProps | null;
  pixPlusV2VoletExterneItem: PixPlusV2VoletExterneDataProps | null;
};

export class CertificationResultBuilder {
  fullCertificationDataById: Record<number, FullCertificationData>;

  constructor(props: {
    certificationData: CertificationDataProps[];
    learnerData: LearnerDataProps[];
    cleaData: CleaDataProps[];
    pixPlusV2VoletPixData: PixPlusV2VoletPixDataProps[];
    pixPlusV2VoletExterneData: PixPlusV2VoletExterneDataProps[];
  }) {
    const learnerDataByLearnerId = new Map(props.learnerData.map((item) => [item.organizationLearnerId, item]));
    const cleaDataByCertificationCourseId = new Map(props.cleaData.map((item) => [item.certificationCourseId, item]));
    const pixPlusV2VoletPixDataByCertificationCourseId = new Map(
      props.pixPlusV2VoletPixData.map((item) => [item.certificationCourseId, item]),
    );
    const pixPlusV2VoletExterneDataByCertificationCourseId = new Map(
      props.pixPlusV2VoletExterneData.map((item) => [item.certificationCourseId, item]),
    );

    this.fullCertificationDataById = {};

    for (const certificationItem of props.certificationData) {
      const { certificationCourseId, organizationLearnerId } = certificationItem;

      this.fullCertificationDataById[certificationCourseId] = {
        certificationItem,
        learnerItem: organizationLearnerId ? (learnerDataByLearnerId.get(organizationLearnerId) ?? null) : null,
        cleaItem: cleaDataByCertificationCourseId.get(certificationCourseId) ?? null,
        pixPlusV2VoletPixItem: pixPlusV2VoletPixDataByCertificationCourseId.get(certificationCourseId) ?? null,
        pixPlusV2VoletExterneItem: pixPlusV2VoletExterneDataByCertificationCourseId.get(certificationCourseId) ?? null,
      };
    }
  }

  build(uuidGenerator: () => UUID) {
    const errors: Record<number, string> = {};
    const certificationResults = [];
    const userCertificationResults = [];
    for (const {
      certificationItem,
      learnerItem,
      cleaItem,
      pixPlusV2VoletPixItem,
      pixPlusV2VoletExterneItem,
    } of Object.values(this.fullCertificationDataById)) {
      const franceCompetencesMinScore = isRecognizedByFranceCompetences(
        certificationItem.deliveredAt,
        certificationItem.framework,
        certificationItem.algorithmEngineVersion,
      )
        ? FRANCE_COMPETENCES_MIN_SCORE
        : null;
      let results;
      switch (certificationItem.algorithmEngineVersion) {
        case AlgorithmEngineVersion.V1:
          results = buildV1Results(certificationItem);
          break;
        case AlgorithmEngineVersion.V2:
          results = buildV2Results(certificationItem, cleaItem, pixPlusV2VoletPixItem, pixPlusV2VoletExterneItem);
          break;
        case AlgorithmEngineVersion.V3:
          results = buildV3Results(certificationItem, cleaItem);
          break;
        default:
          results = null;
      }
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
        certificationCenter: certificationItem.certificationCenter ?? certificationItem.certificationCenterFallback,
        startedAt: certificationItem.startedAt,
        deliveredAt: certificationItem.deliveredAt,
        status: certificationItem.status,
        framework: certificationItem.framework,
        franceCompetencesMinScore,
        commentByAutoJury: certificationItem.commentByAutoJury,
        commentByJury: certificationItem.commentByJury,
        commentForOrganization: certificationItem.commentForOrganization,
        commentForCandidate: certificationItem.commentForCandidate,
        results: results as Results,
      });
      const validationErr = certificationResult.validate();
      if (validationErr) {
        errors[certificationItem.certificationCourseId] = validationErr;
        continue;
      }
      certificationResults.push(certificationResult);
      userCertificationResults.push(
        new UserCertificationResult({
          certificationCourseId: certificationItem.certificationCourseId,
          sessionId: certificationItem.sessionId,
          organizationLearnerId: learnerItem?.organizationLearnerId ?? null,
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

function buildV3Results(certificationData: CertificationDataProps, cleaData: CleaDataProps | null): V3Results {
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
      v3EduExternalJuryResult: certificationData.v3EduExternalJuryResult,
    };
  }
  if (certificationData.framework === Frameworks.CLEA) {
    return {
      maxReachableLevel: certificationData.maxReachableLevel,
      reachedMeshIndex: certificationData.reachedMeshIndex,
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
      hasAcquiredClea: cleaData!.hasAcquiredClea,
      cleaBadgeId: cleaData!.cleaBadgeId,
    };
  }
  return {
    maxReachableLevel: certificationData.maxReachableLevel,
    reachedMeshIndex: certificationData.reachedMeshIndex,
  };
}

function buildV2Results(
  certificationData: CertificationDataProps,
  cleaData: CleaDataProps | null,
  pixPlusV2VoletPixItem: PixPlusV2VoletPixDataProps | null,
  pixPlusV2VoletExterneItem: PixPlusV2VoletExterneDataProps | null,
): V2Results {
  if (certificationData.framework === Frameworks.CLEA) {
    return {
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
      hasAcquiredClea: cleaData!.hasAcquiredClea,
      cleaBadgeId: cleaData!.cleaBadgeId,
    };
  }
  if (certificationData.framework === Frameworks.PRO_SANTE) {
    return {
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
      v2VoletPixAcquired: pixPlusV2VoletPixItem!.v2VoletPixAcquired,
      v2VoletPixBadgeId: pixPlusV2VoletPixItem!.v2VoletPixBadgeId,
    };
  }
  if (certificationData.framework === Frameworks.DROIT) {
    return {
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
      v2VoletPixAcquired: pixPlusV2VoletPixItem!.v2VoletPixAcquired,
      v2VoletPixBadgeId: pixPlusV2VoletPixItem!.v2VoletPixBadgeId,
    };
  }
  if (isEduFramework(certificationData.framework)) {
    return {
      pixScore: certificationData.pixScore,
      competenceMarks: certificationData.competenceMarks,
      v2VoletPixAcquired: pixPlusV2VoletPixItem!.v2VoletPixAcquired,
      v2VoletPixBadgeId: pixPlusV2VoletPixItem!.v2VoletPixBadgeId,
      v2VoletExterneBadgeId: pixPlusV2VoletExterneItem?.v2VoletExterneBadgeId ?? null,
      v2VoletExterneAcquired: pixPlusV2VoletExterneItem?.v2VoletExterneAcquired ?? null,
    };
  }
  return {
    pixScore: certificationData.pixScore,
    competenceMarks: certificationData.competenceMarks,
  };
}

function buildV1Results(certificationData: CertificationDataProps): V1Results {
  return {
    pixScore: certificationData.pixScore,
    competenceMarks: certificationData.competenceMarks,
  };
}

function isRecognizedByFranceCompetences(deliveredAt: Date, framework: string, algorithmEngineVersion: number) {
  if (algorithmEngineVersion === AlgorithmEngineVersion.V1) return;
  // @ts-expect-error je sais pas
  if (![Frameworks.CORE, Frameworks.CLEA].includes(framework)) return;

  return deliveredAt.getTime() >= FRANCE_COMPETENCES_PROFESSIONAL_START_DATE.getTime();
}
