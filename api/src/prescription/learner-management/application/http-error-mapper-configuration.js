import { PreconditionFailedError } from '../../../shared/application/errors/http-errors.js';
import { AggregateImportError, CouldNotDeleteLearnersError, SiecleXmlImportError } from '../domain/errors.js';

const learnerManagementDomainErrorMappingConfiguration = [
  {
    name: AggregateImportError.name,
    httpErrorFn: (aggregateError) => {
      // For AggregateImportError, all errors are aggregated in error.meta
      return aggregateError.meta.map((error) => new PreconditionFailedError(error.message, error.code, error.meta));
    },
  },
  {
    name: CouldNotDeleteLearnersError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code, error.meta),
  },
  {
    name: SiecleXmlImportError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code, error.meta),
  },
];

export { learnerManagementDomainErrorMappingConfiguration };
