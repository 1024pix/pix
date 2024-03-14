import { DomainError } from '../../../lib/domain/errors.js';

class UnableToAttachChildOrganizationToParentOrganizationError extends DomainError {
  constructor({
    code = 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_PARENT_ORGANIZATION',
    message = 'Unable to attach child organization to parent organization',
    meta,
  } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export { UnableToAttachChildOrganizationToParentOrganizationError };
