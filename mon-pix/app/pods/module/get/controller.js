import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class GetController extends Controller {
  @service store;
  @service metrics;

  @action
  async submitAnswer(answerData) {
    await this.store
      .createRecord('element-answer', {
        userResponse: answerData.userResponse,
        elementId: answerData.element.id,
        passage: this.model.passage,
      })
      .save({
        adapterOptions: { passageId: this.model.passage.id },
      });

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.model.module.id}`,
      'pix-event-name': `Click sur le bouton vérifier de l'élément : ${answerData.element.id}`,
    });
  }

  @action
  async trackRetry(answerData) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.model.module.id}`,
      'pix-event-name': `Click sur le bouton réessayer de l'élément : ${answerData.element.id}`,
    });
  }
}
