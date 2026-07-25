import { NotFoundError } from '../../../../shared/domain/errors.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CenterNotHabilitatedError,
  SessionNotAccessibleError,
} from '../errors.js';

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
    if (!this.isSessionAccessible) throw new SessionNotAccessibleError();
    if (!this.isCenterHabilitatedForCandidateSubscription) {
      throw new CenterNotHabilitatedError();
    }
    if (!this.authorizedToStart) {
      if (this.certificationId) {
        throw new CandidateNotAuthorizedToResumeCertificationTestError();
      }
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}
