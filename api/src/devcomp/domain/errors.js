import { DomainError } from '../../shared/domain/errors.js';

class UserNotAuthorizedToFindTrainings extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à récupérer les formations.") {
    super(message);
  }
}

class ModuleDoesNotExistError extends DomainError {
  constructor(message = "Le module id n'existe pas") {
    super(message);
  }
}

export { ModuleDoesNotExistError, UserNotAuthorizedToFindTrainings };
