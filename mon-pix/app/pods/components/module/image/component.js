import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleImage extends Component {
  @tracked modalIsOpen = false;
  @service metrics;

  get hasAlternativeText() {
    return this.args.image.alternativeText.length > 0;
  }

  @action
  showModal() {
    this.modalIsOpen = true;
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.moduleId}`,
      'pix-event-name': `Click sur le bouton alternative textuelle : ${this.args.image.id}`,
    });
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }
}
