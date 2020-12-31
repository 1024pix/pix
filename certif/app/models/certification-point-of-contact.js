import Model, { hasMany, attr } from '@ember-data/model';

export default class CertificationPointOfContact extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() pixCertifTermsOfServiceAccepted;
  @attr() currentCertificationCenterId;
  @hasMany('session') sessions;
  @hasMany('certification-center') certificationCenters;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
