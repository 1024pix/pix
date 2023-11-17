import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class GetController extends Controller {
  @service store;
  @service metrics;

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

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.model.id}`,
      'pix-event-name': `Click sur le bouton vérifier de l'élément : ${answerData.elementId}`,
    });
  }
}
