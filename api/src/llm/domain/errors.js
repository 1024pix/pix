import { DomainError } from '../../shared/domain/errors.js';

export class ConfigurationNotFoundError extends DomainError {
  constructor(id) {
    super(`The configuration of id "${id}" does not exist`);
  }
}

export class NoUserIdProvidedError extends DomainError {
  constructor() {
    super('Must provide a user ID to use LLM API');
  }
}

export class LLMApiError extends DomainError {
  constructor(errorStr) {
    super(`Something went wrong when reaching the LLM Api : ${errorStr}`);
  }
}

export class ApiNetworkError extends DomainError {
  constructor(errorStr) {
    super(`A network error occurred when reaching the LLM Api : ${errorStr}`);
  }
}

export class ChatNotFoundError extends DomainError {
  constructor(id) {
    super(`The chat of id "${id}" does not exist`);
  }
}

export class ChatForbiddenError extends DomainError {
  constructor() {
    super('User has not the right to use this chat');
  }
}

export class TooLargeMessageInputError extends DomainError {
  constructor() {
    super("You've reached the max characters input");
  }
}

export class MaxPromptsReachedError extends DomainError {
  constructor() {
    super("You've reached the max prompts authorized");
  }
}

export class NoAttachmentNeededError extends DomainError {
  constructor() {
    super('Attachment has been provided but is not expected for the given configuration');
  }
}

export class NoAttachmentNorMessageProvidedError extends DomainError {
  constructor() {
    super('At least a message or an attachment, if applicable, must be provided');
  }
}

// Cette erreur est une règle métier importante, on veut vraiment savoir tout de suite si ça arrive
export class IncorrectMessagesOrderingError extends DomainError {
  constructor() {
    super('Messages must respect the ordering enforced by LLM providers');
    // ✅ system prompt -> user -> assistant -> user ...
    // 💥 system prompt -> assistant ...
    // 💥 system prompt -> user -> user ...
  }
}

export class PromptAlreadyOngoingError extends DomainError {
  constructor(chatId) {
    super(`A prompt is already ongoing for chat with id ${chatId}`);
  }
}
