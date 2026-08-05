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
    this.hasStartedCertification = !!certificationId;
    this.hasExceededCertificationDuration = hasExceededCertificationDuration;
    this.isCenterHabilitatedForCandidateSubscription = isCenterHabilitatedForCandidateSubscription;
  }

  verifyCanStartOrResumeCertification(enteredAccessCode) {
    if (this.accessCode !== enteredAccessCode) throw new NotFoundError('Session not found');
    if (!this.isCenterHabilitatedForCandidateSubscription) {
      throw new CenterNotHabilitatedError();
    }
    if (!this.hasStartedCertification && !this.isSessionAccessible) throw new SessionNotAccessibleError();
    if (!this.authorizedToStart) {
      if (this.hasStartedCertification) {
        throw new CandidateNotAuthorizedToResumeCertificationTestError();
      }
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}
