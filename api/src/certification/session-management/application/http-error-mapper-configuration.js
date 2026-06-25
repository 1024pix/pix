import {
  BadRequestError,
  ConflictError,
  PreconditionFailedError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '../../../shared/application/errors/http-errors.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import {
  CertificationCenterIsArchivedError,
  ChallengeToBeDeneutralizedNotFoundError,
  ChallengeToBeNeutralizedNotFoundError,
  InvalidSessionSupervisingLoginError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionFinalized,
  SessionNotAccessible,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
} from '../domain/errors.js';

const sessionDomainErrorMappingConfiguration = [
  {
    name: SessionWithoutStartedCertificationError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: SessionWithMissingAbortReasonError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code),
  },
  {
    name: SessionAlreadyFinalizedError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code),
  },
  {
    name: SessionAlreadyPublishedError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code),
  },
  {
    name: ChallengeToBeDeneutralizedNotFoundError.name,
    httpErrorFn: (error) => new NotFoundError(error.message, error.code),
  },
  {
    name: ChallengeToBeNeutralizedNotFoundError.name,
    httpErrorFn: (error) => new NotFoundError(error.message, error.code),
  },
  {
    name: SessionNotAccessible.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code, error.meta),
  },
  {
    name: SessionFinalized.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
  {
    name: InvalidSessionSupervisingLoginError.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message, error.code),
  },
  {
    name: CertificationCenterIsArchivedError.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message, error.code),
  },
  {
    name: SendingEmailToRefererError.name,
    httpErrorFn: (error) => new ServiceUnavailableError(error.message),
  },
  {
    name: SendingEmailToResultRecipientError.name,
    httpErrorFn: (error) => new ServiceUnavailableError(error.message),
  },
];

export { sessionDomainErrorMappingConfiguration };
