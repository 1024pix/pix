class GenericOrganizationLearnerFilter {
  constructor({ organizationId, attributeName, values }) {
    this.organizationId = organizationId;
    this.attributeName = attributeName;
    this.values = values;
  }

  get dataToInsert() {
    return {
      organization_id: this.organizationId,
      attribute_name: this.attributeName,
      values: JSON.stringify(this.values.sort()),
    };
  }
}
export { GenericOrganizationLearnerFilter };
