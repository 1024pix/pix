import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') areNewYearOrganizationLearnersImported;
  @attr('number') participantCount;
  @attr('string') lang;
  @attr('boolean') enableMultipleSendingAssessment;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasCurrentOrganizationWithGARAsIdentityProvider() {
    return this.userOrgaSettings.get('organization').get('identityProviderForCampaigns') === 'GAR';
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
