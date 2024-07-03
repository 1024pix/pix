import { DomainError } from '../../../lib/domain/errors.js';

class UncancellableCertificationCenterInvitationError extends DomainError {
  constructor(
    message = "L'invitation à ce centre de certification ne peut pas être annulée.",
    code = 'UNCANCELLABLE_CERTIFICATION_CENTER_INVITATION_CODE',
  ) {
    super(message, code);
  }
}

class UncancellableOrganizationInvitationError extends DomainError {
  constructor(
    message = "L'invitation à cette organisation ne peut pas être annulée.",
    code = 'UNCANCELLABLE_ORGANIZATION_INVITATION_CODE',
  ) {
    super(message, code);
  }
}

class MembershipNotFound extends DomainError {}

export {
  MembershipNotFound,
  UncancellableCertificationCenterInvitationError,
  UncancellableOrganizationInvitationError,
};
