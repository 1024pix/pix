import { memberAction } from '@1024pix/ember-api-actions';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { equal } from '@ember/object/computed';
import Model, { attr, hasMany } from '@ember-data/model';
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
  @attr() features;
  @attr('nullable-string') code;
  @attr() parentOrganizationId;
  @attr('nullable-string') parentOrganizationName;
  @equal('type', 'SCO') isOrganizationSCO;
  @equal('type', 'SUP') isOrganizationSUP;

  @hasMany('organization-membership', { async: true, inverse: 'organization' }) organizationMemberships;
  @hasMany('target-profile-summary', { async: true, inverse: null }) targetProfileSummaries;
  @hasMany('tag', { async: true, inverse: null }) tags;
  @hasMany('organization', { async: true, inverse: null }) children;

  static get featureList() {
    return {
      MULTIPLE_SENDING_ASSESSMENT: 'MULTIPLE_SENDING_ASSESSMENT',
      PLACES_MANAGEMENT: 'PLACES_MANAGEMENT',
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
      LEARNER_IMPORT: 'LEARNER_IMPORT',
    };
  }

  get isComputeCertificabilityEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY].active;
  }

  get isLearnerImportEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.LEARNER_IMPORT].active;
  }

  get learnerImportFormatName() {
    if (!this.isLearnerImportEnabled) return null;
    return this.features[Organization.featureList.LEARNER_IMPORT].params.name;
  }

  get isMultipleSendingAssessmentEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.MULTIPLE_SENDING_ASSESSMENT].active;
  }

  set isMultipleSendingAssessmentEnabled(value) {
    if (!this.features) {
      this.features = {};
      this.features[Organization.featureList.MULTIPLE_SENDING_ASSESSMENT] = {};
    }
    this.features[Organization.featureList.MULTIPLE_SENDING_ASSESSMENT].active = value;
  }

  get isPlacesManagementEnabled() {
    if (!this.features) return false;
    return this.features[Organization.featureList.PLACES_MANAGEMENT].active;
  }

  set isPlacesManagementEnabled(value) {
    if (!this.features) {
      this.features = {};
      this.features[Organization.featureList.PLACES_MANAGEMENT] = {};
    }

    this.features[Organization.featureList.PLACES_MANAGEMENT].active = value;
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
