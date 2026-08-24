import Model, { attr } from '@warp-drive/legacy/model';

export default class CorrectionResponse extends Model {
  @attr('string') status;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() feedback;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() solution;

  get isOk() {
    return this.status === 'ok';
  }

  get isKo() {
    return this.status === 'ko';
  }
}
