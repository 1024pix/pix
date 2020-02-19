import Model, { belongsTo, attr } from '@ember-data/model';

export default class CompetenceEvaluation extends Model {

  // attributes
  @attr('string') status;
  @attr('date') createdAt;
  @attr('date') updatedAt;

  // includes
  @belongsTo('assessment') assessment;
  @belongsTo('competence') competence
  @belongsTo('scorecard', { async: false }) scorecard;
  @belongsTo('user') user;

  // references
  @attr('string') competenceId;
}
