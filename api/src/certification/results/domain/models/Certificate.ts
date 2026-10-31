type CertificateProps = {
  id: number;
  algorithmEngineVersion: number;
  userId: number | null;
  firstName: string;
  middleName: string | null;
  thirdName: string | null;
  lastName: string;
  externalId: string | null;
  birthdate: string;
  birthplace: string;
  verificationCode: string;
  certificationCenter: string;
  startedAt: Date;
  deliveredAt: Date;
  status: string;
  versionId: number | null;
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
  maxReachableLevel: number | null;
  reachedMeshIndex: number | null;
  pixScore: number | null;
  competenceMarks: Array<CompetenceMarkV3Props>;
};

type PixPlusV3Results = {
  reachedMeshIndex: number | null;
};

type EduV3Results = PixPlusV3Results & {
  eduV3ExternalJuryResult: string | null;
};

type CleaV3Results = CoreV3Results & {
  acquired: boolean;
  complementaryCertificationBadgeId: number;
};

export class Certificate {
  readonly id: number;
  readonly algorithmEngineVersion: number;
  readonly userId: number | null;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly thirdName: string | null;
  readonly lastName: string;
  readonly externalId: string | null;
  readonly birthdate: string;
  readonly birthplace: string;
  readonly verificationCode: string;
  readonly certificationCenter: string;
  readonly startedAt: Date;
  readonly deliveredAt: Date;
  readonly status: string;
  readonly versionId: number | null;
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
    userId,
    firstName,
    middleName,
    thirdName,
    lastName,
    externalId,
    birthdate,
    birthplace,
    verificationCode,
    certificationCenter,
    startedAt,
    deliveredAt,
    status,
    versionId,
    framework,
    franceCompetencesMinScore,
    commentByAutoJury,
    commentByJury,
    commentForOrganization,
    commentForCandidate,
    results,
  }: CertificateProps) {
    this.id = id;
    this.algorithmEngineVersion = algorithmEngineVersion;
    this.userId = userId;
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.lastName = lastName;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.verificationCode = verificationCode;
    this.certificationCenter = certificationCenter;
    this.startedAt = startedAt;
    this.deliveredAt = deliveredAt;
    this.status = status;
    this.versionId = versionId;
    this.framework = framework;
    this.franceCompetencesMinScore = franceCompetencesMinScore;
    this.commentByAutoJury = commentByAutoJury;
    this.commentByJury = commentByJury;
    this.commentForOrganization = commentForOrganization;
    this.commentForCandidate = commentForCandidate;
    this.results = results;
  }
}
