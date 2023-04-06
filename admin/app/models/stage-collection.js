import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class Stage extends Model {
  //@belongsTo('target-profile') targetProfile;
  @hasMany('stage') stages;
}
