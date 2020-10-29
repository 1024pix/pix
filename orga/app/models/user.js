import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
