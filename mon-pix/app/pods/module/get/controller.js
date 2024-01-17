import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class GetController extends Controller {
  @service store;
  @service metrics;

  @action
  async submitAnswer(answerData) {
    await this.store
      .createRecord('element-answer', {
        userResponse: answerData.userResponse,
        element: answerData.element,
      })
      .save({
        adapterOptions: { elementId: answerData.element.id, moduleSlug: this.model.module.id },
      });

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.model.module.id}`,
      'pix-event-name': `Click sur le bouton vérifier de l'élément : ${answerData.elementId}`,
    });
  }
}
