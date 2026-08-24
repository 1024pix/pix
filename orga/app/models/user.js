import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class User extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('string') lang;
  @attr('boolean') cgu;
  @attr('string') pixOrgaTermsOfServiceStatus;
  @hasMany('membership', { async: true, inverse: 'user' }) memberships;
  @belongsTo('user-orga-setting', { async: true, inverse: 'user' }) userOrgaSettings;
}
