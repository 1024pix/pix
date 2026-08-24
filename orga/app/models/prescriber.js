import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') pixOrgaTermsOfServiceStatus;
  @attr('string') pixOrgaTermsOfServiceDocumentPath;
  @attr('boolean') areNewYearOrganizationLearnersImported;
  @attr('number') participantCount;
  @attr('string') lang;
  @attr() features;
  @hasMany('membership', { async: true, inverse: null }) memberships;
  @belongsTo('user-orga-setting', { async: true, inverse: null }) userOrgaSettings;

  static get featureList() {
    return {
      ATTESTATIONS_MANAGEMENT: 'ATTESTATIONS_MANAGEMENT',
      MULTIPLE_SENDING_ASSESSMENT: 'MULTIPLE_SENDING_ASSESSMENT',
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
      PLACES_MANAGEMENT: 'PLACES_MANAGEMENT',
      MISSIONS_MANAGEMENT: 'MISSIONS_MANAGEMENT',
      LEARNER_IMPORT: 'LEARNER_IMPORT',
      ORALIZATION: 'ORALIZATION',
      COVER_RATE: 'COVER_RATE',
      CAMPAIGN_WITHOUT_USER_PROFILE: 'CAMPAIGN_WITHOUT_USER_PROFILE',
    };
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasCurrentOrganizationWithGARAsIdentityProvider() {
    return this.userOrgaSettings.get('organization').get('identityProviderForCampaigns') === 'GAR';
  }

  get enableMultipleSendingAssessment() {
    return this.features[Prescriber.featureList.MULTIPLE_SENDING_ASSESSMENT]?.active;
  }

  get enableCampaignWithoutUserProfile() {
    return this.features[Prescriber.featureList.CAMPAIGN_WITHOUT_USER_PROFILE]?.active;
  }

  get computeOrganizationLearnerCertificability() {
    return this.features[Prescriber.featureList.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY]?.active;
  }

  get placesManagement() {
    return this.features[Prescriber.featureList.PLACES_MANAGEMENT]?.active;
  }

  get attestationsManagement() {
    return this.features[Prescriber.featureList.ATTESTATIONS_MANAGEMENT]?.active;
  }

  get missionsManagement() {
    return this.features[Prescriber.featureList.MISSIONS_MANAGEMENT]?.active;
  }

  get isAdminOfTheCurrentOrganization() {
    return this.hasMany('memberships')
      .value()
      .some(
        (membership) =>
          membership.get('organizationRole') === 'ADMIN' &&
          membership.get('organization').get('id') === this.userOrgaSettings.get('organization').get('id'),
      );
  }

  get hasOrganizationLearnerImport() {
    return this.features[Prescriber.featureList.LEARNER_IMPORT]?.active;
  }

  get hasOralizationFeature() {
    return this.features[Prescriber.featureList.ORALIZATION]?.active;
  }

  get hasParticipants() {
    return Boolean(this.participantCount);
  }

  get hasCoverRateFeature() {
    return this.features[Prescriber.featureList.COVER_RATE]?.active;
  }
}
