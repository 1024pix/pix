import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Element extends Model {
  @attr('string') type;
  @attr('boolean') isAnswerable;

  @belongsTo('grain', { inverse: 'elements' }) grain;
  @hasMany('element-answer', { inverse: 'element' }) elementAnswers;

  get isText() {
    return this.type === 'texts';
  }

  get isQcu() {
    return this.type === 'qcus';
  }

  get isAnswered() {
    return this.elementAnswers.length > 0;
  }

  get lastCorrection() {
    return this.isAnswered ? this.elementAnswers.lastObject.correction : undefined;
  }
}
