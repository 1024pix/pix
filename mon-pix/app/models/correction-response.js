import Model, { attr } from '@ember-data/model';

export default class CorrectionResponse extends Model {
  @attr('string') status;
  @attr() feedback;
  @attr() solution;

  get isOk() {
    return this.status === 'ok';
  }

  get isKo() {
    return this.status === 'ko';
  }
}
