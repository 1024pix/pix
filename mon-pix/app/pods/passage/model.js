import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';

export default class Passage extends Model {
  @attr('string') moduleId;

  @hasMany('element-answer', { async: false, inverse: 'passage' }) elementAnswers;

  getLastCorrectionForElement(element) {
    const elementAnswers = this.elementAnswers.filter((answer) => answer.elementId === element.id);
    return elementAnswers.at(-1)?.correction;
  }

  terminate = memberAction({
    path: 'terminate',
    type: 'post',
  });
}
