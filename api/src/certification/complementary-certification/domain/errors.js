import { DomainError } from '../../../shared/domain/errors.js';

class InvalidBadgeLevelError extends DomainError {
  constructor(message = 'Badge level inconsistency') {
    super(message);
    this.code = 'INVALID_BADGE_LEVEL';
  }
}

export { InvalidBadgeLevelError };
