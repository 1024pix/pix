import Model, { attr, belongsTo } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @belongsTo('organization') organization;
}
