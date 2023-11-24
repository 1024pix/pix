import { DomainError } from '../../shared/domain/errors.js';

class UserNotAuthorizedToFindTrainings extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à récupérer les formations.") {
    super(message);
  }
}

export { UserNotAuthorizedToFindTrainings };
