import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') areNewYearOrganizationLearnersImported;
  @attr('number') participantCount;
  @attr('string') lang;
  @attr() features;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;

  static get featureList() {
    return {
      MULTIPLE_SENDING_ASSESSMENT: 'MULTIPLE_SENDING_ASSESSMENT',
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
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

  get isAdminOfTheCurrentOrganization() {
    const memberships = this.memberships.toArray();
    return memberships.some(
      (membership) =>
        membership.get('organizationRole') === 'ADMIN' &&
        membership.get('organization').get('id') === this.userOrgaSettings.get('organization').get('id'),
    );
  }

  get hasParticipants() {
    return Boolean(this.participantCount);
  }
}
