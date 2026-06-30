import Model, { attr } from '@ember-data/model';

export const CERTIFICATE_STATUSES = {
  WAITING_FOR_RESULTS: 'WAITING_FOR_RESULTS',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  CANCELLED_BY_JURY: 'CANCELLED_BY_JURY',
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

export default class CertificateSummary extends Model {
  @attr('string') verificationCode;
  @attr('date') certificationStartedAt;
  @attr('string') certificationFramework;
  @attr('string') certificationCenterName;
  @attr('number') pixScore;
  @attr('string') comment;
  @attr('string') status;
  @attr('string') extraCertificationStatus;
  @attr('string') certificateType;
  @attr('string') reachedMeshLevel;
  @attr('string') badgeUrl;

  get isValidated() {
    return this.status === CERTIFICATE_STATUSES.VALIDATED;
  }

  get isRejected() {
    return this.status === CERTIFICATE_STATUSES.REJECTED;
  }

  get isCancelled() {
    return this.status === CERTIFICATE_STATUSES.CANCELLED || this.status === CERTIFICATE_STATUSES.CANCELLED_BY_JURY;
  }

  get isWaitingForResults() {
    return this.status === CERTIFICATE_STATUSES.WAITING_FOR_RESULTS;
  }

  get isDocumentAttestation() {
    return this.certificateType === CERTIFICATE_TYPES.ATTESTATION;
  }
}
