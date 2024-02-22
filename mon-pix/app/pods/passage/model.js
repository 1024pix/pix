import Model, { attr, hasMany } from '@ember-data/model';

export default class Passage extends Model {
  @attr('string') moduleId;

  @hasMany('element-answer', { async: false, inverse: 'passage' }) elementAnswers;

  getLastCorrectionForElement(element) {
    return this.elementAnswers.find((answer) => answer.elementId === element.id)?.correction;
  }
}
