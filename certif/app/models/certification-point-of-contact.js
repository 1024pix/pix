import Model, { hasMany, attr } from '@ember-data/model';

export default class CertificationPointOfContact extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() pixCertifTermsOfServiceAccepted;
  @hasMany('allowed-certification-center-access') allowedCertificationCenterAccesses;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
