import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Element extends Model {
  @attr('string') type;

  @belongsTo('grain', { inverse: 'elements' }) grain;
  @hasMany('element-answer', { inverse: 'element' }) elementAnswers;

  get isText() {
    return this.type === 'texts';
  }

  get isQcu() {
    return this.type === 'qcus';
  }
}
