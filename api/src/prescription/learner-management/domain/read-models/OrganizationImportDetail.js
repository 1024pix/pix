export class OrganizationImportDetail {
  constructor({ id, status, errors, updatedAt, firstName, lastName }) {
    this.id = id;
    this.status = status;
    this.errors = errors;
    this.updatedAt = updatedAt;
    this.createdBy = {
      firstName,
      lastName,
    };
  }
}
