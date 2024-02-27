import Model, { belongsTo } from '@ember-data/model';

export default class UserOrgaSetting extends Model {
  @belongsTo('user', { async: true, inverse: 'userOrgaSettings' }) user;
  @belongsTo('organization', { async: true, inverse: null }) organization;
}
