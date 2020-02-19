import Model, { belongsTo } from '@ember-data/model';

export default class AssessmentResult extends Model {

  // includes
  @belongsTo('assessment') assessment;

}
