import type { Framework } from '../../../../shared/domain/types.ts';
import type { CertificationResultStatus } from '../../types.ts';

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
  certificationCenter: string;
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
export type LearnerDataProps = {
  organizationLearnerId: number;
  middleName: string | null;
  thirdName: string | null;
  nationalStudentId: string | null;
};
export type CleaDataProps = {
  certificationCourseId: number;
  cleaBadgeId: number;
  hasAcquiredClea: boolean;
};
export type PixPlusV2VoletPixDataProps = {
  certificationCourseId: number;
  v2ComplementaryVoletPixBadgeId: number;
  v2ComplementaryVoletPixAcquired: boolean;
};
export type PixPlusV2VoletExterneDataProps = {
  certificationCourseId: number;
  v2EduVoletExterneBadgeId: number;
  v2EduVoletExterneAcquired: boolean;
};

export type CertificationResultSourceData = {
  certificationData: CertificationDataProps[];
  learnerData: LearnerDataProps[];
  cleaData: CleaDataProps[];
  pixPlusV2VoletPixData: PixPlusV2VoletPixDataProps[];
  pixPlusV2VoletExterneData: PixPlusV2VoletExterneDataProps[];
};

export type FullCertificationData = {
  certificationItem: CertificationDataProps;
  learnerItem: LearnerDataProps | null;
  cleaItem: CleaDataProps | null;
  pixPlusV2VoletPixItem: PixPlusV2VoletPixDataProps | null;
  pixPlusV2VoletExterneItem: PixPlusV2VoletExterneDataProps | null;
};
