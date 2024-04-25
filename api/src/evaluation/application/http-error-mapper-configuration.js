import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import { EmptyAnswerError, ImproveCompetenceEvaluationForbiddenError } from '../domain/errors.js';

const evaluationDomainErrorMappingConfiguration = [
  {
    name: EmptyAnswerError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.BadRequestError(error.message, error.code);
    },
  },
  {
    name: ImproveCompetenceEvaluationForbiddenError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.ForbiddenError(error.message, error.code);
    },
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { evaluationDomainErrorMappingConfiguration };
