import Model, { attr } from '@ember-data/model';

export default class CorrectionResponse extends Model {
  @attr('string') status;
  @attr('string') feedback;
  @attr('string') solutionId;

  get isOk() {
    return this.status === 'ok';
  }
}
