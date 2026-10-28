import { Frameworks, isEduFramework } from '../../../shared/domain/models/Frameworks.js';
import { FRANCE_COMPETENCES_PROFESSIONAL_START_DATE } from '../constants.js';
import { Certificate, type Results } from './Certificate.ts';
const FRANCE_COMPETENCES_MIN_SCORE = 120;

type CompetenceMarkDataV3Props = {
  level: number;
  competenceId: string;
};
type CertificationDataV3Props = {
  id: number;
  algorithmEngineVersion: number;
  userId: number | null;
  firstName: string;
  lastName: string;
  birthdate: string;
  birthplace: string;
  verificationCode: string;
  certificationCenter: string;
  startedAt: Date;
  deliveredAt: Date;
  status: string;
  versionId: number | null;
  framework: string;
  maxReachableLevel: number | null;
  pixScore: number | null;
  reachedMeshIndex: number | null;
  eduV3ExternalJuryResult: string | null;
  commentByAutoJury: string | null;
  commentByJury: string | null;
  commentForOrganization: string | null;
  commentForCandidate: string | null;
  competenceMarks: Array<CompetenceMarkDataV3Props>;
};
type LearnerDataV3Props = {
  middleName: string | null;
  thirdName: string | null;
  externalId: string | null;
};
type CleaDataV3Props = {
  acquired: boolean;
  complementaryCertificationBadgeId: number;
};

export function buildForV3(
  certificationData: CertificationDataV3Props,
  learnerData: LearnerDataV3Props | null,
  cleaData: CleaDataV3Props | null,
) {
  const franceCompetencesMinScore = isRecognizedByFranceCompetences(
    certificationData.deliveredAt,
    certificationData.framework,
  )
    ? FRANCE_COMPETENCES_MIN_SCORE
    : null;
  const results = buildV3Results(certificationData, cleaData);
  return new Certificate({
    id: certificationData.id,
    algorithmEngineVersion: certificationData.algorithmEngineVersion,
    userId: certificationData.userId,
    firstName: certificationData.firstName,
    middleName: learnerData?.middleName ?? null,
    thirdName: learnerData?.thirdName ?? null,
    lastName: certificationData.lastName,
    externalId: learnerData?.externalId ?? null,
    birthdate: certificationData.birthdate,
    birthplace: certificationData.birthplace,
    verificationCode: certificationData.verificationCode,
    certificationCenter: certificationData.certificationCenter,
    startedAt: certificationData.startedAt,
    deliveredAt: certificationData.deliveredAt,
    status: certificationData.status,
    versionId: certificationData.versionId,
    framework: certificationData.framework,
    franceCompetencesMinScore,
    commentByAutoJury: certificationData.commentByAutoJury,
    commentByJury: certificationData.commentByJury,
    commentForOrganization: certificationData.commentForOrganization,
    commentForCandidate: certificationData.commentForCandidate,
    results,
  });
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
    reachedMeshIndex: certificationData.reachedMeshIndex,
  };
}

function isRecognizedByFranceCompetences(deliveredAt: Date, framework: string) {
  // @ts-expect-error je sais pas
  if (![Frameworks.CORE, Frameworks.CLEA].includes(framework)) return;
  return deliveredAt.getTime() >= FRANCE_COMPETENCES_PROFESSIONAL_START_DATE.getTime();
}
