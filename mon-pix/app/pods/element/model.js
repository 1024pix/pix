import Model, { belongsTo, attr } from '@ember-data/model';

export default class Element extends Model {
  @belongsTo('module', { inverse: 'elements' }) module;
  @attr('string') type;

  get isText() {
    return this.type === 'texts';
  }

  get isQcu() {
    return this.type === 'qcus';
  }
}
