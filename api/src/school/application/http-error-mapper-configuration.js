import { PreconditionFailedError } from '../../shared/application/errors/http-errors.js';
import { NotInProgressAssessmentError } from '../domain/school-errors.js';

const schoolDomainErrorMappingConfiguration = [
  {
    name: NotInProgressAssessmentError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code, error.meta),
  },
];

export { schoolDomainErrorMappingConfiguration };
