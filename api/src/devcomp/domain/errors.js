import { DomainError } from '../../shared/domain/errors.js';

class ModuleDoesNotExistError extends DomainError {
  constructor(message = 'The module does not exist') {
    super(message);
  }
}

class ModuleInstantiationError extends DomainError {
  constructor(message = 'The module can not be instantiated due to incoherent data') {
    super(message);
  }
}

class ElementInstantiationError extends DomainError {
  constructor(message = 'The element can not be instantiated due to incoherent data') {
    super(message);
  }
}

class PassageDoesNotExistError extends DomainError {
  constructor(message = 'The passage does not exist') {
    super(message);
  }
}

class PassageTerminatedError extends DomainError {
  constructor(message = 'This passage is terminated') {
    super(message);
  }
}

class UserNotAuthorizedToFindTrainings extends DomainError {
  constructor(message = 'This user is not authorized to access the trainings.') {
    super(message);
  }
}

export {
  ElementInstantiationError,
  ModuleDoesNotExistError,
  ModuleInstantiationError,
  PassageDoesNotExistError,
  PassageTerminatedError,
  UserNotAuthorizedToFindTrainings,
};
