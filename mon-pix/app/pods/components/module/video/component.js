import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Plyr from 'plyr';
import player_fr from '../../../plyr-translation/player_fr';

export default class ModuleVideo extends Component {
  @tracked modalIsOpen = false;
  @service metrics;

  @action
  showModal() {
    this.modalIsOpen = true;
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Afficher la transcription : ${this.args.video.id}`,
      'pix-event-name': `Clic sur le bouton transcription : ${this.args.video.id}`,
    });
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  @action
  launchPlyr() {
    new Plyr(document.getElementById(this.args.video.id), {
      hideControls: false,
      disableContextMenu: false,
      i18n: player_fr,
    });
  }
}
