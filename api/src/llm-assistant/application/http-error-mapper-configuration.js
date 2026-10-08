import { ServiceUnavailableError } from '../../shared/application/errors/http-errors.js';
import { InferenceProviderError, InferenceProviderNotConfiguredError } from '../domain/errors.ts';

export const llmAssistantDomainErrorMappingConfiguration = [
  {
    name: InferenceProviderError.name,
    httpErrorFn: (error) => new ServiceUnavailableError(error.message),
  },
  {
    name: InferenceProviderNotConfiguredError.name,
    httpErrorFn: (error) => new ServiceUnavailableError(error.message),
  },
];
