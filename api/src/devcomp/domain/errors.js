import { DomainError } from '../../shared/domain/errors.js';

class ModuleDoesNotExistError extends DomainError {
  constructor(message = 'The module does not exist') {
    super(message);
  }
}

class PassageDoesNotExistError extends DomainError {
  constructor(message = 'The passage does not exist') {
    super(message);
  }
}

class UserNotAuthorizedToFindTrainings extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à récupérer les formations.") {
    super(message);
  }
}

export { ModuleDoesNotExistError, PassageDoesNotExistError, UserNotAuthorizedToFindTrainings };
