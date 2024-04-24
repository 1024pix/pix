export class OrganizationLearner {
  constructor({ id, firstName, lastName, organizationId, ...attributes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.division = attributes['Libellé classe'];
    this.organizationId = organizationId;
  }
}
