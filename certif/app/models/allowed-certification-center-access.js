import Model, { attr } from '@ember-data/model';

export default class AllowedCertificationCenterAccess extends Model {
  @attr() name;
  @attr() externalId;
  @attr() type;
  @attr() isRelatedToManagingStudentsOrganization;
  @attr() isAccessBlockedCollege;
  @attr() isAccessBlockedLycee;
  @attr() relatedOrganizationTags;

  get isSco() {
    return this.type === 'SCO';
  }

  get isScoManagingStudents() {
    return this.type === 'SCO' && this.isRelatedToManagingStudentsOrganization;
  }
}
