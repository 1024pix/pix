import { HttpErrors } from '../../shared/application/errors/http-errors.js';
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
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: UncancellableOrganizationInvitationError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: AlreadyExistingAdminMemberError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: OrganizationArchivedError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: AlreadyAcceptedOrCancelledInvitationError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code, error.meta),
  },
  {
    name: UserHasNoOrganizationMembershipError.name,
    httpErrorFn: (error) => new HttpErrors.ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: UserNotMemberOfOrganizationError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
];

export { teamDomainErrorMappingConfiguration };
