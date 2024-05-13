class OrganizationFeature {
  constructor({ featureId, organizationId, params }) {
    this.featureId = parseInt(featureId, 10);
    this.organizationId = parseInt(organizationId, 10);
    this.params = params ? JSON.parse(params) : null;
  }
}

export { OrganizationFeature };
