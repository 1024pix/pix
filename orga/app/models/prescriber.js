import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') areNewYearOrganizationLearnersImported;
  @attr('number') participantCount;
  @attr('string') lang;
  @attr() features;
  @hasMany('membership', { async: true, inverse: null }) memberships;
  @belongsTo('user-orga-setting', { async: true, inverse: null }) userOrgaSettings;

  static get featureList() {
    return {
      MULTIPLE_SENDING_ASSESSMENT: 'MULTIPLE_SENDING_ASSESSMENT',
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
      PLACES_MANAGEMENT: 'PLACES_MANAGEMENT',
      MISSIONS_MANAGEMENT: 'MISSIONS_MANAGEMENT',
      LEARNER_IMPORT: 'LEARNER_IMPORT',
    };
  }
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasCurrentOrganizationWithGARAsIdentityProvider() {
    return this.userOrgaSettings.get('organization').get('identityProviderForCampaigns') === 'GAR';
  }

  get enableMultipleSendingAssessment() {
    return this.features[Prescriber.featureList.MULTIPLE_SENDING_ASSESSMENT];
  }

  get computeOrganizationLearnerCertificability() {
    return this.features[Prescriber.featureList.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY];
  }

  get placesManagement() {
    return this.features[Prescriber.featureList.PLACES_MANAGEMENT];
  }

  get missionsManagement() {
    return this.features[Prescriber.featureList.MISSIONS_MANAGEMENT];
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
    return this.features[Prescriber.featureList.LEARNER_IMPORT];
  }

  get hasParticipants() {
    return Boolean(this.participantCount);
  }
}
