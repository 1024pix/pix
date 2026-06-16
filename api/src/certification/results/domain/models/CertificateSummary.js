import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';
import { CertificateMeshLevel } from './v3/CertificateMeshLevel.js';

export const CERTIFICATE_STATUSES = {
  WAITING_FOR_RESULTS: 'WAITING_FOR_RESULTS',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  VALIDATED: 'VALIDATED',
};

export const EXTRA_CERTIFICATE_STATUSES = {
  WAITING_FOR_RESULTS: 'WAITING_FOR_RESULTS',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  ACQUIRED: 'ACQUIRED',
  NOT_ACQUIRED: 'NOT_ACQUIRED',
};

export const CERTIFICATE_TYPES = {
  CERTIFICATE: 'CERTIFICATE',
  ATTESTATION: 'ATTESTATION',
};

export class CertificateSummary {
  #certificateMeshLevel;

  constructor({
    id,
    verificationCode,
    certificationStartedAt,
    certificationFramework,
    certificationCenterName,
    pixScore,
    juryComment,
    status,
    extraCertificationStatus,
    certificateType,
    reachedMeshLevel,
    certificateMeshLevel,
  }) {
    this.id = id;
    this.verificationCode = verificationCode;
    this.certificationStartedAt = certificationStartedAt;
    this.certificationFramework = certificationFramework;
    this.certificationCenterName = certificationCenterName;
    this.pixScore = pixScore;
    this.juryComment = juryComment;
    this.status = status;
    this.extraCertificationStatus = extraCertificationStatus;
    this.certificateType = certificateType;
    this.reachedMeshLevel = reachedMeshLevel;
    this.#certificateMeshLevel = certificateMeshLevel ?? null;
  }

  get badgeUrl() {
    return this.#certificateMeshLevel?.badgeUrl ?? null;
  }

  static buildFrom({
    id,
    verificationCode,
    certificationStartedAt,
    certificationFramework,
    certificationCenterName,
    pixScore,
    commentForCandidate,
    commentByAutoJury,
    assessmentResultStatus,
    isPublished,
    isExtraCertificationAcquired,
    algorithmVersion,
    reachedMeshIndex,
    eduV3ExternalJuryResult,
  }) {
    const mappingAssessmentResultStatuses = {
      [AssessmentResult.status.CANCELLED]: CERTIFICATE_STATUSES.CANCELLED,
      [AssessmentResult.status.VALIDATED]: CERTIFICATE_STATUSES.VALIDATED,
      [AssessmentResult.status.REJECTED]: CERTIFICATE_STATUSES.REJECTED,
    };

    const mappingExtraCertificationStatus = {
      [true]: EXTRA_CERTIFICATE_STATUSES.ACQUIRED,
      [false]: EXTRA_CERTIFICATE_STATUSES.NOT_ACQUIRED,
      [null]: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
    };

    const isWaitingForResult = !isPublished;
    const isCancelled = assessmentResultStatus === AssessmentResult.status.CANCELLED;
    const isRejectedV3 =
      AlgorithmEngineVersion.isV3(algorithmVersion) && assessmentResultStatus === AssessmentResult.status.REJECTED;

    let status, extraCertificationStatus;
    if (isWaitingForResult) {
      status = CERTIFICATE_STATUSES.WAITING_FOR_RESULTS;
      extraCertificationStatus = null;
    } else {
      status = mappingAssessmentResultStatuses[assessmentResultStatus];
      extraCertificationStatus = isCancelled ? null : mappingExtraCertificationStatus[isExtraCertificationAcquired];
    }

    const juryComment = new JuryComment({
      commentByAutoJury,
      fallbackComment: commentForCandidate,
      context: JuryCommentContexts.CANDIDATE,
    });

    const certificateType = AlgorithmEngineVersion.isV3(algorithmVersion)
      ? CERTIFICATE_TYPES.CERTIFICATE
      : CERTIFICATE_TYPES.ATTESTATION;

    const certificateMeshLevel =
      isRejectedV3 || isWaitingForResult
        ? null
        : new CertificateMeshLevel({ reachedMeshIndex, certificationFramework, eduV3ExternalJuryResult });

    return new CertificateSummary({
      id,
      verificationCode,
      certificationStartedAt,
      certificationFramework,
      certificationCenterName,
      pixScore,
      juryComment: juryComment,
      status,
      extraCertificationStatus,
      certificateType,
      reachedMeshLevel: certificateMeshLevel?.meshLevel ?? null,
      certificateMeshLevel,
    });
  }
}
