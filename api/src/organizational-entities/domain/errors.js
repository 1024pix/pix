import { DomainError } from '../../shared/domain/errors.js';

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

class AdministrationTeamNotFound extends DomainError {
  constructor({ code = 'ADMINISTRATION_TEAM_NOT_FOUND', message = 'Administration team does not exist', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class ArchiveCertificationCentersInBatchError extends DomainError {
  constructor({ code = 'ARCHIVE_CERTIFICATION_CENTERS_IN_BATCH_ERROR', meta } = {}) {
    super();
    this.code = code;
    this.meta = meta;
  }
}

class ArchiveOrganizationError extends DomainError {
  constructor({ code = 'ARCHIVE_ORGANIZATION_ERROR', message = 'Error during organization archiving', meta } = {}) {
    super(message);
    this.code = code;
    this.message = message;
    this.meta = meta;
  }
}

class ArchiveOrganizationsInBatchError extends DomainError {
  constructor({ meta } = {}) {
    super('Error during organizations batch archiving', 'ARCHIVE_ORGANIZATIONS_IN_BATCH_ERROR');
    this.meta = meta;
  }
}

class CountryNotFoundError extends DomainError {
  constructor({ code = 'COUNTRY_NOT_FOUND', message = 'Country not found', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
class DpoEmailInvalid extends DomainError {
  constructor({ code = 'DPO_EMAIL_INVALID', message = 'DPO email invalid', meta } = {}) {
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

class TagNotFoundError extends DomainError {
  constructor(meta) {
    super('Tag does not exist', 'TAG_NOT_FOUND');
    if (meta) this.meta = meta;
  }
}

class OrganizationBatchUpdateError extends DomainError {
  constructor({ code = 'ORGANIZATION_BATCH_UPDATE_ERROR', message = 'Organization batch update failed', meta } = {}) {
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

class OrganizationLearnerTypeNotFound extends DomainError {
  constructor({
    code = 'ORGANIZATION_LEARNER_TYPE_NOT_FOUND',
    message = 'Organization learner type does not exist',
    meta,
  } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class UnableToDetachParentOrganizationFromChildOrganization extends DomainError {
  constructor({
    code = 'UNABLE_TO_DETACH_PARENT_ORGANIZATION_FROM_CHILD_ORGANIZATION',
    message = 'Unable to detach parent organization from child organization',
    meta,
  } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class NetworkAlreadyExistError extends DomainError {
  constructor({ code = 'NETWORK_ALREADY_EXISTS', message = 'Network already exists', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class ParentOrganizationNotInNetworkError extends DomainError {
  constructor({
    code = 'PARENT_ORGANIZATION_NOT_IN_NETWORK',
    message = 'Parent organization not in network',
    meta,
  } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class StructureNotFoundError extends DomainError {
  constructor({ code = 'STRUCTURE_NOT_FOUND', message = 'Structure not found', meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class UnableToAttachCertificationCenterToOrganization extends DomainError {
  constructor({
    code = 'UNABLE_TO_ATTACH_CERTIFICATION_CENTER_TO_ORGANIZATION',
    message = 'Unable to attach certification center to organization',
    meta,
  } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export {
  AdministrationTeamNotFound,
  ArchiveCertificationCentersInBatchError,
  ArchiveOrganizationError,
  ArchiveOrganizationsInBatchError,
  CountryNotFoundError,
  DpoEmailInvalid,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  NetworkAlreadyExistError,
  OrganizationBatchUpdateError,
  OrganizationLearnerTypeNotFound,
  OrganizationNotFound,
  ParentOrganizationNotInNetworkError,
  StructureNotFoundError,
  TagNotFoundError,
  UnableToAttachCertificationCenterToOrganization,
  UnableToAttachChildOrganizationToParentOrganizationError,
  UnableToDetachParentOrganizationFromChildOrganization,
};
