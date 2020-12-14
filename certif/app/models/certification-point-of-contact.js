import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
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
  @attr() isRelatedOrganizationManagingStudents;
  @hasMany('session') sessions;
  @equal('certificationCenterType', 'SCO') isSco;

  @computed('certificationCenterType', 'isRelatedOrganizationManagingStudents')
  get isScoManagingStudents() {
    return this.certificationCenterType === 'SCO' && this.isRelatedOrganizationManagingStudents;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
