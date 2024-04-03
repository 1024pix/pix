export class OrganizationImportDetail {
  constructor({ id, status, errors, createdAt, updatedAt, firstName, lastName }) {
    this.id = id;
    this.status = status;
    this.errors = errors;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
    this.createdBy = {
      firstName,
      lastName,
    };
  }
}
