import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ModuleImage extends Component {
  @tracked modalIsOpen = false;
  @service metrics;

  @action
  showModal() {
    this.modalIsOpen = true;
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Afficher l’alternative textuelle : ${this.args.image.id}`,
      'pix-event-name': `Click sur le bouton alternative textuelle : ${this.args.image.id}`,
    });
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }
}
