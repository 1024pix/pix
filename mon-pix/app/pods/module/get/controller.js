import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class GetController extends Controller {
  @service store;

  @tracked correctionResponse = {};

  @action
  async submitAnswer(answerData) {
    const elementAnswer = await this.store
      .createRecord('element-answer', {
        userResponse: answerData.userResponse,
      })
      .save({
        adapterOptions: { elementId: answerData.elementId, moduleSlug: this.model.id },
      });

    // Change ref to refresh the component
    this.correctionResponse = {
      ...this.correctionResponse,
    };
    this.correctionResponse[answerData.elementId] = await elementAnswer.correction;
  }
}
