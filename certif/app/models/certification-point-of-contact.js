import Model, { hasMany, attr } from '@ember-data/model';
import { equal } from '@ember/object/computed';

export default class CertificationPointOfContact extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() pixCertifTermsOfServiceAccepted;
  @attr() certificationCenterId;
  @attr() certificationCenterName;
  @attr() certificationCenterType;
  @attr() certificationCenterExternalId;
  @hasMany('session') sessions;
  @equal('certificationCenterType', 'SCO') isSco;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
