import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import { AlreadyExistingAdminMemberError, UncancellableOrganizationInvitationError } from '../domain/errors.js';

const teamDomainErrorMappingConfiguration = [
  {
    name: UncancellableOrganizationInvitationError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message),
  },
  {
    name: AlreadyExistingAdminMemberError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { teamDomainErrorMappingConfiguration };
