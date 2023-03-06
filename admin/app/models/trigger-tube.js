import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class TriggerTube extends Model {
  @attr('number') level;

  @belongsTo('tube') tube;
}
