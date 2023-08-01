import Model, { attr, belongsTo } from '@ember-data/model';

export default class Activity extends Model {
  @attr('string') level;
  @belongsTo('assessment') assessment;
}
