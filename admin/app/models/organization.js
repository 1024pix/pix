import { service } from '@ember/service';
import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import pick from 'lodash/pick';

export default class Organization extends Model {
  @service intl;

  @attr('nullable-string') name;
  @attr('nullable-string') type;
  @attr('nullable-string') logoUrl;
  @attr('nullable-string') externalId;
  @attr('nullable-string') provinceCode;
  @attr('number') credit;
  @attr('nullable-string') email;
  @attr() createdBy;
  @attr('date') createdAt;
  @attr('nullable-string') documentationUrl;
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
  @attr() administrationTeamId;
  @attr('string') administrationTeamName;
  @attr('number') countryCode;
  @attr('string') countryName;
  @attr() organizationLearnerTypeId;
  @attr('string') organizationLearnerTypeName;

  @hasMany('organization-membership', { async: true, inverse: 'organization' }) organizationMemberships;
  @hasMany('target-profile-summary', { async: true, inverse: null }) targetProfileSummaries;
  @hasMany('tag', { async: true, inverse: null }) tags;
  @hasMany('organization', { async: true, inverse: null }) children;
  @hasMany('organization-invitation', { async: true, inverse: null }) organizationInvitations;
  @hasMany('campaign', { async: true, inverse: null }) campaigns;

  @belongsTo('network', { async: true, inverse: null }) network;

  static get featureList() {
    return {
      MULTIPLE_SENDING_ASSESSMENT: 'MULTIPLE_SENDING_ASSESSMENT',
      PLACES_MANAGEMENT: 'PLACES_MANAGEMENT',
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
      LEARNER_IMPORT: 'LEARNER_IMPORT',
      IS_MANAGING_STUDENTS: 'IS_MANAGING_STUDENTS',
      SHOW_NPS: 'SHOW_NPS',
      CAMPAIGN_WITHOUT_USER_PROFILE: 'CAMPAIGN_WITHOUT_USER_PROFILE',
      SHOW_SKILLS: 'SHOW_SKILLS',
      ATTESTATIONS_MANAGEMENT: 'ATTESTATIONS_MANAGEMENT',
      COVER_RATE: 'COVER_RATE',
    };
  }

  static get editableFeatureList() {
    return pick(
      Organization.featureList,
      'MULTIPLE_SENDING_ASSESSMENT',
      'IS_MANAGING_STUDENTS',
      'CAMPAIGN_WITHOUT_USER_PROFILE',
      'SHOW_SKILLS',
      'PLACES_MANAGEMENT',
      'LEARNER_IMPORT',
      'COVER_RATE',
      'ATTESTATIONS_MANAGEMENT',
    );
  }

  get isOrganizationSCO() {
    return this.type === 'SCO';
  }

  get isOrganizationSUP() {
    return this.type === 'SUP';
  }

  async hasMember(userId) {
    const memberships = await this.organizationMemberships;
    return memberships.some((membership) => membership.user?.id === userId);
  }

  get archivedFormattedDate() {
    return this.intl.formatDate(this.archivedAt);
  }

  get createdAtFormattedDate() {
    return this.intl.formatDate(this.createdAt);
  }

  get isArchived() {
    return !!this.archivedAt;
  }

  get isPlacesManagementEnabled() {
    return this.features[Organization.featureList.PLACES_MANAGEMENT].active;
  }

  get dataProtectionOfficerFullName() {
    const fullName = [];

    if (this.dataProtectionOfficerFirstName) fullName.push(this.dataProtectionOfficerFirstName);
    if (this.dataProtectionOfficerLastName) fullName.push(this.dataProtectionOfficerLastName);

    return fullName.join(' ');
  }
}
