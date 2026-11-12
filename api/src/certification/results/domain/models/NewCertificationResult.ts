import type { UUID } from 'node:crypto';

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
  status: string;
  framework: string;
  franceCompetencesMinScore: number | null;
  commentByAutoJury: string | null;
  commentByJury: string | null;
  commentForOrganization: string | null;
  commentForCandidate: string | null;
  results: Results;
};

type CompetenceMarkV3Props = {
  level: number;
  competenceId: string;
};

export type Results = CoreV3Results | PixPlusV3Results | EduV3Results | CleaV3Results;

type CoreV3Results = {
  maxReachableLevel: number;
  reachedMeshIndex: number | null;
  pixScore: number | null;
  competenceMarks: Array<CompetenceMarkV3Props>;
};

type PixPlusV3Results = {
  maxReachableLevel: number;
  reachedMeshIndex: number | null;
};

type EduV3Results = PixPlusV3Results & {
  eduV3ExternalJuryResult: string | null;
};

type CleaV3Results = CoreV3Results & {
  hasAcquiredClea: boolean;
  cleaBadgeId: number;
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
  readonly status: string;
  readonly framework: string;
  readonly franceCompetencesMinScore: number | null;
  readonly commentByAutoJury: string | null;
  readonly commentByJury: string | null;
  readonly commentForOrganization: string | null;
  readonly commentForCandidate: string | null;
  readonly results: Results;
  constructor({
    id,
    algorithmEngineVersion,
    firstName,
    middleName,
    thirdName,
    lastName,
    externalId,
    nationalStudentId,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    verificationCode,
    certificationCenter,
    startedAt,
    deliveredAt,
    status,
    framework,
    franceCompetencesMinScore,
    commentByAutoJury,
    commentByJury,
    commentForOrganization,
    commentForCandidate,
    results,
  }: CertificationResultProps) {
    this.id = id;
    this.algorithmEngineVersion = algorithmEngineVersion;
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.lastName = lastName;
    this.externalId = externalId;
    this.nationalStudentId = nationalStudentId;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.birthCountry = birthCountry;
    this.verificationCode = verificationCode;
    this.certificationCenter = certificationCenter;
    this.startedAt = startedAt;
    this.deliveredAt = deliveredAt;
    this.status = status;
    this.framework = framework;
    this.franceCompetencesMinScore = franceCompetencesMinScore;
    this.commentByAutoJury = commentByAutoJury;
    this.commentByJury = commentByJury;
    this.commentForOrganization = commentForOrganization;
    this.commentForCandidate = commentForCandidate;
    this.results = results;
  }
}

type UserCertificationResultProps = {
  userId: number;
  certificationCourseId: number | null;
  sessionId: number | null;
  certificationResultId: UUID;
};

export class UserCertificationResult {
  readonly userId: number;
  readonly certificationCourseId: number | null;
  readonly sessionId: number | null;
  readonly certificationResultId: UUID;

  constructor({ userId, certificationCourseId, sessionId, certificationResultId }: UserCertificationResultProps) {
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.sessionId = sessionId;
    this.certificationResultId = certificationResultId;
  }
}
