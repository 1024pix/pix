import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import {
  AlreadyExistingOrganizationFeatureError,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  OrganizationNotFound,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../domain/errors.js';

const organizationalEntitiesDomainErrorMappingConfiguration = [
  {
    name: UnableToAttachChildOrganizationToParentOrganizationError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code, error.meta),
  },
  {
    name: AlreadyExistingOrganizationFeatureError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code, error.meta),
  },
  {
    name: OrganizationNotFound.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: FeatureNotFound.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: FeatureParamsNotProcessable.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { organizationalEntitiesDomainErrorMappingConfiguration };
