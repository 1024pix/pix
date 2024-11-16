export class OrganizationLearner {
  constructor({ id, firstName, lastName, features, organizationId, ...attributes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.features = features;
    this.organizationId = organizationId;
    this.division = attributes['Libellé classe'];
  }
}
