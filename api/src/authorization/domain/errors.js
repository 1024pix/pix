import { DomainError } from '../../shared/domain/errors.js';

class AdminMemberError extends DomainError {
  constructor(message = 'An error occurred on admin member', code = 'ADMIN_MEMBER_ERROR') {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export { AdminMemberError };
