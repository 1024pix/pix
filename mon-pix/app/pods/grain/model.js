import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Grain extends Model {
  @attr('string') title;

  @hasMany('element', { async: false, polymorphic: true, inverse: 'grain' }) elements;
  @belongsTo('module', { async: false, inverse: 'grains' }) module;

  get hasAnswerableElements() {
    return this.elements.some((element) => element.isAnswerable);
  }

  get answerableElements() {
    return this.elements.filter((element) => {
      return element.isAnswerable;
    });
  }

  get allElementsAreAnswered() {
    return this.answerableElements.every((element) => {
      return element.isAnswered;
    });
  }
}
