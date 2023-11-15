import Model, { attr, belongsTo } from '@ember-data/model';

export default class CorrectionResponse extends Model {
  @attr('string') status;
  @attr('string') feedback;
  @attr('string') solutionId;
  @belongsTo('element') element;

  get isOk() {
    return this.status === 'ok';
  }
}
