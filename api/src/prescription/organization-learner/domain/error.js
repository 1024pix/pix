import { DomainError } from '../../../shared/domain/errors.js';

export class OrganizationLearnerIdentityNotFoundError extends DomainError {
  constructor(message = 'Organization Learner Identity not found.') {
    super(message);
  }
}
