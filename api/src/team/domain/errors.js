import { DomainError } from '../../shared/domain/errors.js';

class AdminMemberError extends DomainError {
  constructor(message = 'An error occurred on admin member', code = 'ADMIN_MEMBER_ERROR') {
    super(message);
    this.code = code;
    this.message = message;
  }
}

class AlreadyAcceptedOrCancelledInvitationError extends DomainError {
  constructor() {
    super('The invitation has already been accepted or cancelled', 'INVITATION_ALREADY_ACCEPTED_OR_CANCELLED');
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

class UserNotMemberOfOrganizationError extends DomainError {
  constructor(message = "L'utilisateur n'est pas membre de l'organisation.") {
    super(message);
  }
}

class UserHasNoOrganizationMembershipError extends DomainError {
  constructor() {
    super('User is not member of any organization', 'USER_HAS_NO_ORGANIZATION_MEMBERSHIP');
  }
}

class MembershipNotFound extends DomainError {}

class OrganizationArchivedError extends DomainError {
  constructor(message = "L'organisation est archivée.") {
    super(message);
  }
}

export {
  AdminMemberError,
  AlreadyAcceptedOrCancelledInvitationError,
  AlreadyExistingAdminMemberError,
  MembershipNotFound,
  OrganizationArchivedError,
  UncancellableCertificationCenterInvitationError,
  UncancellableOrganizationInvitationError,
  UserHasNoOrganizationMembershipError,
  UserNotMemberOfOrganizationError,
};
