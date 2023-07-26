import Model, { attr, belongsTo } from '@ember-data/model';

export default class CompetenceEvaluation extends Model {
  // attributes
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') updatedAt;

  // references
  @attr('string') competenceId;

  // includes
  @belongsTo('assessment', { async: true, inverse: null }) assessment;
  @belongsTo('scorecard', { async: true, inverse: null }) scorecard;
  @belongsTo('user', { async: true, inverse: null }) user;
}
