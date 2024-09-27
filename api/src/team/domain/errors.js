import { DomainError } from '../../shared/domain/errors.js';

class AlreadyAcceptedOrCancelledInvitationError extends DomainError {
  constructor(message = "L'invitation a déjà été acceptée ou annulée.") {
    super(message);
  }
}

class AlreadyExistingAdminMemberError extends DomainError {
  constructor(message = 'Cet agent a déjà accès') {
    super(message);
  }
}

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

class OrganizationArchivedError extends DomainError {
  constructor(message = "L'organisation est archivée.") {
    super(message);
  }
}

export {
  AlreadyAcceptedOrCancelledInvitationError,
  AlreadyExistingAdminMemberError,
  MembershipNotFound,
  OrganizationArchivedError,
  UncancellableCertificationCenterInvitationError,
  UncancellableOrganizationInvitationError,
};
