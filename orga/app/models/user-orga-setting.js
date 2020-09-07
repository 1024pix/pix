import Model, { belongsTo } from '@ember-data/model';

export default class UserOrgaSetting extends Model {
  @belongsTo('user') user;
  @belongsTo('organization') organization;
}
