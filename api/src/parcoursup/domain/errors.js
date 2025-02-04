import { DomainError } from '../../shared/domain/errors.js';

export class MoreThanOneMatchingCertificationError extends DomainError {
  constructor(message = 'More than one candidate found for current search parameters') {
    super(message);
  }
}
