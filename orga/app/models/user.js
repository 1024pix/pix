import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class User extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('string') lang;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;
}
