import Model, { attr } from '@ember-data/model';

export default class AllowedCertificationCenterAccess extends Model {
  @attr() name;
  @attr() externalId;
  @attr() type;
  @attr() isRelatedToManagingStudentsOrganization;
  @attr() isAccessBlockedCollege;
  @attr() isAccessBlockedLycee;
  @attr() isAccessBlockedAEFE;
  @attr() isAccessBlockedAgri;
  @attr() relatedOrganizationTags;

  get isSco() {
    return this.type === 'SCO';
  }

  get isScoManagingStudents() {
    return this.type === 'SCO' && this.isRelatedToManagingStudentsOrganization;
  }

  get isAccessRestricted() {
    return this.isAccessBlockedCollege || this.isAccessBlockedLycee || this.isAccessBlockedAEFE || this.isAccessBlockedAgri;
  }
}
