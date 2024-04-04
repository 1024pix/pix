import { DomainError } from '../../../shared/domain/errors.js';

class OrganizationLearnersCouldNotBeSavedError extends DomainError {
  constructor(message = 'An error occurred during process') {
    super(message);
  }
}

class OrganizationDoesNotHaveFeatureEnabledError extends DomainError {
  constructor(message = 'The organization does not have the feature enabled') {
    super(message);
  }
}

class SiecleXmlImportError extends DomainError {
  constructor(code, meta) {
    super('An error occurred during Siecle XML import');
    this.code = code;
    this.meta = meta;
  }
}

class AggregateImportError extends DomainError {
  constructor(meta) {
    super('An error occurred during import validation');
    this.meta = meta;
  }
}
class OrganizationImportNotFoundError extends DomainError {
  constructor(organizationId) {
    super(`OrganizationImport not found for the organizationId ${organizationId}`);
  }
}
class OrganizationLearnerImportFormatNotFoundError extends DomainError {
  constructor(organizationId) {
    super(`organizationLearnerImportFormat not found for the organizationId ${organizationId}`);
  }
}

export {
  AggregateImportError,
  OrganizationDoesNotHaveFeatureEnabledError,
  OrganizationImportNotFoundError,
  OrganizationLearnerImportFormatNotFoundError,
  OrganizationLearnersCouldNotBeSavedError,
  SiecleXmlImportError,
};
