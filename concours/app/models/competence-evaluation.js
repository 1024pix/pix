import Model, { belongsTo, attr } from '@ember-data/model';

export default class CompetenceEvaluation extends Model {

  // attributes
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') updatedAt;

  // references
  @attr('string') competenceId;

  // includes
  @belongsTo('assessment') assessment;
  @belongsTo('scorecard', { async: false }) scorecard;
  @belongsTo('user') user;
}
