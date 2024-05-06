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

class AlreadyExistingOrganizationFeatureError extends DomainError {
  constructor({
    code = 'ALREADY_EXISTING_ORGANIZATION_FEATURE',
    message = 'Unable to add feature to organization',
    meta,
  } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class OrganizationNotFound extends DomainError {
  constructor({ code = 'ORGANIZATION_NOT_FOUND', message = 'Organization does not exist', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class FeatureNotFound extends DomainError {
  constructor({ code = 'FEATURE_NOT_FOUND', message = 'Feature does not exist', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class FeatureParamsNotProcessable extends DomainError {
  constructor({ code = 'FEATURE_PARAMS_NOT_PROCESSABLE', message = 'Feature params are not processable', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export {
  AlreadyExistingOrganizationFeatureError,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  OrganizationNotFound,
  UnableToAttachChildOrganizationToParentOrganizationError,
};
