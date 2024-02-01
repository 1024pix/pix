import Model, { attr, belongsTo } from '@ember-data/model';

export default class Mission extends Model {
  @attr('string') name;
  @attr('string') index;

  @belongsTo('competence') competence;
}
