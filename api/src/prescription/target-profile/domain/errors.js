import { DomainError } from '../../../shared/domain/errors.js';

class TargetProfileCannotBeCreated extends DomainError {
  constructor(message = 'Erreur lors de la création du profil cible.') {
    super(message);
  }
}

export { TargetProfileCannotBeCreated };
