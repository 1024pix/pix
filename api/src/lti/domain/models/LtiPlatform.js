export class LtiPlatform {
  constructor({ id, issuer, organizationIds }) {
    this.id = id;
    this.issuer = issuer;
    this.organizationIds = organizationIds;
  }
}
