import { DomainError } from '../../../shared/domain/errors.js';

class NoCertificationResultForDivision extends DomainError {
  constructor(message = 'Aucun résultat de certification pour cette classe.') {
    super(message);
  }
}

export { NoCertificationResultForDivision };
