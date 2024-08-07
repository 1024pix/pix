import { IMPORT_STATUSES } from '../constants.js';

export class OrganizationImport {
  static create({ organizationId, createdBy }) {
    return new OrganizationImport({
      organizationId,
      createdBy,
      createdAt: new Date(),
      status: IMPORT_STATUSES.UPLOADING,
    });
  }

  constructor({ id, status, filename, encoding, errors, updatedAt, createdAt, createdBy, organizationId }) {
    this.id = id;
    this.status = status;
    this.filename = filename;
    this.encoding = encoding;
    this.errors = errors;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.organizationId = organizationId;
  }

  upload({ filename, encoding, errors = [] }) {
    if (errors.length > 0) {
      this.status = IMPORT_STATUSES.UPLOAD_ERROR;
      this.errors = errors;
    } else {
      this.status = IMPORT_STATUSES.UPLOADED;
      this.filename = filename;
      this.encoding = encoding;
    }
    this.updatedAt = new Date();
  }

  validate({ errors = [], warnings = [] }) {
    if (errors.length > 0) {
      this.status = IMPORT_STATUSES.VALIDATION_ERROR;
      this.errors = [...errors, ...warnings];
    } else {
      this.status = IMPORT_STATUSES.VALIDATED;
      this.errors = warnings.length > 0 ? warnings : null;
    }
    this.updatedAt = new Date();
  }

  process({ errors = [] }) {
    if (errors.length > 0) {
      this.status = IMPORT_STATUSES.IMPORT_ERROR;
      this.errors = errors;
    } else {
      this.status = IMPORT_STATUSES.IMPORTED;
    }
    this.updatedAt = new Date();
  }
}
