import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') areNewYearSchoolingRegistrationsImported;
  @attr('string') lang;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdminOfTheCurrentOrganization() {
    const memberships = this.memberships.toArray();
    return memberships.some(
      (membership) =>
        membership.get('organizationRole') === 'ADMIN' &&
        membership.get('organization').get('id') === this.userOrgaSettings.get('organization').get('id')
    );
  }
}
