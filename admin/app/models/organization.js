import { memberAction } from 'ember-api-actions';
import Model, { hasMany, attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { equal } from '@ember/object/computed';
import dayjs from 'dayjs';

export default class Organization extends Model {
  @attr('nullable-string') name;
  @attr('nullable-string') type;
  @attr('nullable-string') logoUrl;
  @attr('nullable-string') externalId;
  @attr('nullable-string') provinceCode;
  @attr('boolean') isManagingStudents;
  @attr('boolean') showNPS;
  @attr('string') formNPSUrl;
  @attr('number') credit;
  @attr('nullable-string') email;
  @attr() createdBy;
  @attr('date') createdAt;
  @attr('nullable-string') documentationUrl;
  @attr('boolean') showSkills;
  @attr('nullable-string') archivistFullName;
  @attr('date') archivedAt;
  @attr('nullable-string') creatorFullName;
  @attr() identityProviderForCampaigns;
  @attr() dataProtectionOfficerFirstName;
  @attr() dataProtectionOfficerLastName;
  @attr() dataProtectionOfficerEmail;

  @equal('type', 'SCO') isOrganizationSCO;
  @equal('type', 'SUP') isOrganizationSUP;

  @hasMany('organizationMembership') organizationMemberships;
  @hasMany('targetProfileSummary') targetProfileSummaries;
  @hasMany('tag') tags;

  async hasMember(userId) {
    const memberships = await this.organizationMemberships;
    return !!memberships.findBy('user.id', userId);
  }

  get archivedFormattedDate() {
    return dayjs(this.archivedAt).format('DD/MM/YYYY');
  }

  get createdAtFormattedDate() {
    return dayjs(this.createdAt).format('DD/MM/YYYY');
  }

  get isArchived() {
    return !!this.archivistFullName;
  }

  get sortedTargetProfileSummaries() {
    return this.targetProfileSummaries.sortBy('id');
  }

  get dataProtectionOfficerFullName() {
    return `${this.dataProtectionOfficerFirstName} ${this.dataProtectionOfficerLastName}`;
  }

  attachTargetProfiles = memberAction({
    path: 'attach-target-profiles',
    type: 'post',
  });
}
