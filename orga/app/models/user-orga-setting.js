import DS from 'ember-data';
const { belongsTo, Model } = DS;

export default class UserOrgaSetting extends Model {
  @belongsTo('user') user;
  @belongsTo('organization') organization;
}
