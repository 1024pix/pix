import { DomainError } from '../../../lib/domain/errors.js';

class ForbiddenAccess extends DomainError {
  constructor(message = 'Accès non autorisé.') {
    super(message);
  }
}

export { ForbiddenAccess };
