import { UnprocessableEntityError } from '../../shared/application/errors/http-errors.js';
import { LegalDocumentInvalidDateError } from '../domain/errors.js';

const legalDocumentsDomainErrorMappingConfiguration = [
  {
    name: LegalDocumentInvalidDateError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
];

export { legalDocumentsDomainErrorMappingConfiguration };
