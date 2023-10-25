import Model, { belongsTo, attr } from '@ember-data/model';

export default class Element extends Model {
  @belongsTo('module', { inverse: 'elements' }) module;
  @attr('string') type;

  get isLesson() {
    return this.type === 'lessons';
  }

  get isQcu() {
    return this.type === 'qcus';
  }
}
