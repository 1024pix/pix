import { DomainError } from '../../shared/domain/errors.js';

export class InferenceProviderError extends DomainError {
  constructor(reason: string) {
    super(`Something went wrong when reaching the inference provider: ${reason}`);
  }
}

export class InferenceProviderNotConfiguredError extends DomainError {
  constructor(variable: string) {
    super(`The inference provider is not configured: ${variable} is not set`);
  }
}
