import Model, { attr, belongsTo } from '@ember-data/model';

export default class Grain extends Model {
  @attr('string') title;
  @attr({ defaultValue: () => [] }) elements;
  @attr('string') type;

  @belongsTo('module', { async: false, inverse: 'grains' }) module;

  get hasAnswerableElements() {
    return this.elements.some((element) => element.isAnswerable);
  }

  get answerableElements() {
    return this.elements.filter((element) => {
      return element.isAnswerable;
    });
  }

  allElementsAreAnsweredForPassage(passage) {
    return this.answerableElements.every((element) => {
      return !!passage.getLastCorrectionForElement(element);
    });
  }
}
