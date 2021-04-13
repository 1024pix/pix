import Model, { attr, belongsTo } from '@ember-data/model';

export default class BadgeCriterion extends Model {
  @attr('string') scope;
  @attr('number') threshold;

  @belongsTo('badge') badge;
}
