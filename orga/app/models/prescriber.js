import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @attr('boolean') areNewYearSchoolingRegistrationsImported;
  @attr('string') lang;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;
}
