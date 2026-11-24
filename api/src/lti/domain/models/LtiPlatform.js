export class LtiPlatform {
  constructor({ id, issuer, organizationIds }) {
    this.id = id;
    this.issuer = issuer;
    this.organizationIds = organizationIds;
  }

  get issuerOrigin() {
    return new URL(this.issuer).origin;
  }
}
