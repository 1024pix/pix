import { HttpErrors } from '../../../shared/application/http-errors.js';
import { AggregateImportError } from '../domain/errors.js';

const learnerManagementDomainErrorMappingConfiguration = [
  {
    name: AggregateImportError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
];

export { learnerManagementDomainErrorMappingConfiguration };
