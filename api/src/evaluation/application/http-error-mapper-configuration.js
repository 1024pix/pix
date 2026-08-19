import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  PreconditionFailedError,
} from '../../shared/application/errors/http-errors.js';
import {
  AcquiredBadgeForbiddenUpdateError,
  AlreadyRatedAssessmentError,
  AnswerEvaluationError,
  AssessmentAlreadyEndedError,
  CompetenceResetError,
  ImproveCompetenceEvaluationForbiddenError,
} from '../domain/errors.js';

const evaluationDomainErrorMappingConfiguration = [
  {
    name: ImproveCompetenceEvaluationForbiddenError.name,
    httpErrorFn: (error) => {
      return new ForbiddenError(error.message, error.code);
    },
  },
  {
    name: CompetenceResetError.name,
    httpErrorFn: (error) => {
      return new PreconditionFailedError(error.message);
    },
  },
  {
    name: AcquiredBadgeForbiddenUpdateError.name,
    httpErrorFn: (error) => {
      return new ForbiddenError(error.message);
    },
  },
  {
    name: AnswerEvaluationError.name,
    httpErrorFn: (error) => {
      return new InternalServerError(error.message);
    },
  },
  {
    name: AssessmentAlreadyEndedError.name,
    httpErrorFn: (error) => {
      return new ConflictError(error.message, error.code);
    },
  },
  {
    name: AlreadyRatedAssessmentError.name,
    httpErrorFn: (error) => {
      return new PreconditionFailedError(error.message);
    },
  },
];

export { evaluationDomainErrorMappingConfiguration };
