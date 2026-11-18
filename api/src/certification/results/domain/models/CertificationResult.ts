import type { UUID } from 'node:crypto';

import { I18n } from 'i18n';

import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';
import type { Framework } from '../../../shared/domain/types.ts';
import { CERTIFICATION_RESULT_STATUSES } from '../constants.ts';
import type { CertificationResultStatus } from '../types.ts';

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

type OldCertificationResultProps = {
  id: number;
  firstName: string;
  lastName: string;
  birthplace: string;
  birthdate: string;
  externalId: string;
  createdAt: Date;
  sessionId: number;
  status: string;
  framework: Framework;
  reachedMeshIndex: number;
  pixScore: number;
  version: number;
  commentForOrganization: string;
  competenceMarks: Array<CompetenceMark>;
  complementaryCertificationCourseResults: Array<ComplementaryCertificationCourseResult>;
  assessmentResultStatus: string;
  commentByAutoJury: string;
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

  /**
   * @deprecated
   */
  static from(certificationResultDTO: OldCertificationResultProps) {
    const certificationStatus = certificationResultDTO?.certificationResultDTO?.assessmentResultStatus ?? Assessment.states.STARTED;

    const commentForOrganization = new JuryComment({
      fallbackComment: certificationResultDTO.commentForOrganization,
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: certificationResultDTO.commentByAutoJury,
    });

    const competenceMarkDTOs = certificationResultDTO.competenceMarks?.filter(Boolean);
    const competencesWithMark = competenceMarkDTOs?.map(
      (competenceMarkDTO) =>
        new CompetenceMark({
          ...competenceMarkDTO,
          area_code: competenceMarkDTO.area_code.toString(),
          competence_code: competenceMarkDTO.competence_code.toString(),
        }),
    );

    const complementaryCertificationCourseResults = certificationResultDTO.complementaryCertificationCourseResults
      ?.filter(Boolean)
      .map(
        (complementaryCertifCourseResult) =>
          new ComplementaryCertificationCourseResult(complementaryCertifCourseResult),
      );

    // TODO Build a convertTool from version to algoEnginVersion
    return new CertificationResult({
      algorithmEngineVersion: AlgorithmEngineVersion.V2,
      birthCountry: 'France',
      birthINSEECode: '66212',
      birthPostalCode: '66440',
      birthdate: certificationResultDTO.birthdate,
      certificationCenter: '',
      id: certificationResultDTO.id,
      firstName: certificationResultDTO.firstName,
      lastName: certificationResultDTO.lastName,
      birthplace: certificationResultDTO.birthplace,
      externalId: certificationResultDTO.externalId,
      createdAt: certificationResultDTO.createdAt,
      sessionId: certificationResultDTO.sessionId,
      status: certificationStatus,
      framework: certificationResultDTO.framework,
      reachedMeshIndex: certificationResultDTO.reachedMeshIndex,
      pixScore: certificationResultDTO.pixScore,
      version: certificationResultDTO.version,
      commentForOrganization: commentForOrganization.getComment((key) => I18n.__(key)) || null,
      competencesWithMark,
      complementaryCertificationCourseResults,
    });
  }

  isCoreFramework() {
    return this.framework === Frameworks.CORE;
  }

  isCancelled() {
    return this.status === CERTIFICATION_RESULT_STATUSES.CANCELLED;
  }

  isValidated() {
    return this.status === CERTIFICATION_RESULT_STATUSES.VALIDATED;
  }

  isRejected() {
    return this.status === CERTIFICATION_RESULT_STATUSES.REJECTED;
  }

  isStarted() {
    return this.status === Assessment.states.STARTED;
  }

  isInError() {
    return this.status === CERTIFICATION_RESULT_STATUSES.ERROR;
  }

  getUniqComplementaryCertificationCourseResultLabels() {
    return []
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
