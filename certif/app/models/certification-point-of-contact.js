import Model, { hasMany, attr } from '@ember-data/model';

export default class CertificationPointOfContact extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() lang;
  @attr() pixCertifTermsOfServiceAccepted;
  @hasMany('allowed-certification-center-access') allowedCertificationCenterAccesses;
  @hasMany('certification-center-membership') certificationCenterMemberships;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get isMemberOfACertificationCenter() {
    return this.allowedCertificationCenterAccesses.length > 0;
  }
}
