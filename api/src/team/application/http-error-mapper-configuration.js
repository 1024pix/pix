import {
  ConflictError,
  ForbiddenError,
  UnprocessableEntityError,
} from '../../shared/application/errors/http-errors.js';
import {
  AdminMemberError,
  AlreadyAcceptedOrCancelledInvitationError,
  AlreadyExistingAdminMemberError,
  OrganizationArchivedError,
  UncancellableOrganizationInvitationError,
  UserHasNoOrganizationMembershipError,
  UserNotMemberOfOrganizationError,
} from '../domain/errors.js';

const teamDomainErrorMappingConfiguration = [
  {
    name: AdminMemberError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: UncancellableOrganizationInvitationError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: AlreadyExistingAdminMemberError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: OrganizationArchivedError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: AlreadyAcceptedOrCancelledInvitationError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code, error.meta),
  },
  {
    name: UserHasNoOrganizationMembershipError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: UserNotMemberOfOrganizationError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
];

export { teamDomainErrorMappingConfiguration };
