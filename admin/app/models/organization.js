// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { equal } from '@ember/object/computed';
import Model, { attr, hasMany } from '@ember-data/model';
import dayjs from 'dayjs';
import { memberAction } from 'ember-api-actions';

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
  @attr() features;
  @attr('nullable-string') code;
  @attr() parentOrganizationId;
  @attr('nullable-string') parentOrganizationName;
  @equal('type', 'SCO') isOrganizationSCO;
  @equal('type', 'SUP') isOrganizationSUP;

  @hasMany('organizationMembership') organizationMemberships;
  @hasMany('targetProfileSummary') targetProfileSummaries;
  @hasMany('tag') tags;
  @hasMany('organization', { inverse: null }) children;

  static get featureList() {
    return {
      MULTIPLE_SENDING_ASSESSMENT: 'MULTIPLE_SENDING_ASSESSMENT',
      PLACES_MANAGEMENT: 'PLACES_MANAGEMENT',
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
    };
  }

  get isComputeCertificabilityEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY];
  }

  get isMultipleSendingAssessmentEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.MULTIPLE_SENDING_ASSESSMENT];
  }

  set isMultipleSendingAssessmentEnabled(value) {
    if (!this.features) {
      this.features = {};
    }
    this.features[Organization.featureList.MULTIPLE_SENDING_ASSESSMENT] = value;
  }

  get isPlacesManagementEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.PLACES_MANAGEMENT];
  }

  set isPlacesManagementEnabled(value) {
    if (!this.features) {
      this.features = {};
    }
    this.features[Organization.featureList.PLACES_MANAGEMENT] = value;
  }

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
    return !!this.archivedAt;
  }

  get sortedTargetProfileSummaries() {
    return this.targetProfileSummaries.sortBy('id');
  }

  get dataProtectionOfficerFullName() {
    const fullName = [];

    if (this.dataProtectionOfficerFirstName) fullName.push(this.dataProtectionOfficerFirstName);
    if (this.dataProtectionOfficerLastName) fullName.push(this.dataProtectionOfficerLastName);

    return fullName.join(' ');
  }

  attachTargetProfiles = memberAction({
    path: 'attach-target-profiles',
    type: 'post',
  });
}
