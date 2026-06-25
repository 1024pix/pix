import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  PayloadTooLargeError,
  ServiceUnavailableError,
} from '../../shared/application/errors/http-errors.js';
import {
  ChatForbiddenError,
  ChatNotFoundError,
  ConfigurationNotFoundError,
  IncorrectMessagesOrderingError,
  LLMApiError,
  MaxPromptsReachedError,
  NoAttachmentNeededError,
  NoAttachmentNorMessageProvidedError,
  NoUserIdProvidedError,
  PromptAlreadyOngoingError,
  TooLargeMessageInputError,
} from '../domain/errors.js';

export const llmDomainErrorMappingConfiguration = [
  {
    name: ChatNotFoundError.name,
    httpErrorFn: (error) => new NotFoundError(error.message, error.code, error.meta),
  },
  {
    name: MaxPromptsReachedError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: ChatForbiddenError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: PromptAlreadyOngoingError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code, error.meta),
  },
  {
    name: ConfigurationNotFoundError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: NoUserIdProvidedError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: NoAttachmentNeededError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: NoAttachmentNorMessageProvidedError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: LLMApiError.name,
    httpErrorFn: (error) => new ServiceUnavailableError(error.message),
  },
  {
    name: IncorrectMessagesOrderingError.name,
    httpErrorFn: (error) => new InternalServerError(error.message),
  },
  {
    name: TooLargeMessageInputError.name,
    httpErrorFn: (error) => new PayloadTooLargeError(error.message, error.code, error.meta),
  },
];
