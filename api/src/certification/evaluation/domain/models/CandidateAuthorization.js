import {
  CandidateNotAuthorizedToJoinSessionError, // todo move me
  CandidateNotAuthorizedToResumeCertificationTestError, // todo move me
  NotFoundError,
} from '../../../../shared/domain/errors.js';
import { SessionNotAccessible } from '../../../session-management/domain/errors.js';
import { CenterHabilitationError } from '../../../shared/domain/errors.js'; // todo create me in eval

export class CandidateAuthorization {
  constructor({
    id,
    accessCode,
    isSessionAccessible,
    userId,
    reconciledAt,
    subscription,
    authorizedToStart,
    certificationId,
    hasExceededCertificationDuration,
    isCenterHabilitatedForCandidateSubscription,
  }) {
    this.id = id;
    this.accessCode = accessCode;
    this.isSessionAccessible = isSessionAccessible;
    this.userId = userId;
    this.reconciledAt = reconciledAt;
    this.subscription = subscription;
    this.authorizedToStart = authorizedToStart;
    this.certificationId = certificationId;
    this.hasExceededCertificationDuration = hasExceededCertificationDuration;
    this.isCenterHabilitatedForCandidateSubscription = isCenterHabilitatedForCandidateSubscription;
  }

  verifyCanStartOrResumeCertification(enteredAccessCode) {
    if (this.accessCode !== enteredAccessCode) throw new NotFoundError('Session not found');
    if (!this.isSessionAccessible) throw new SessionNotAccessible();
    if (!this.isCenterHabilitatedForCandidateSubscription) {
      throw new CenterHabilitationError();
    }
    if (!this.authorizedToStart) {
      if (this.certificationId) {
        throw new CandidateNotAuthorizedToResumeCertificationTestError();
      }
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}
