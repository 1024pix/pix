import { NotFoundError } from '../../../../shared/domain/errors.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CenterNotHabilitatedError,
  SessionNotJoinableError,
} from '../errors.js';

export class CandidateAuthorization {
  constructor({
    id,
    accessCode,
    isSessionJoinable,
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
    this.isSessionJoinable = isSessionJoinable;
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
    if (!this.hasStartedCertification && !this.isSessionJoinable) throw new SessionNotJoinableError();
    if (!this.authorizedToStart) {
      if (this.hasStartedCertification) {
        throw new CandidateNotAuthorizedToResumeCertificationTestError();
      }
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}
