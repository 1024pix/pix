import Model, { belongsTo, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @belongsTo('user-orga-setting') userOrgaSettings;
}
