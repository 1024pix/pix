import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Plyr from 'plyr';

import player_fr from '../plyr-translation/player_fr';

export default class ModuleVideo extends Component {
  @tracked modalIsOpen = false;
  @service metrics;

  get hasSubtitles() {
    return this.args.video.subtitles.length > 0;
  }

  get hasTranscription() {
    return this.args.video.transcription.length > 0;
  }

  @action
  showModal() {
    this.modalIsOpen = true;
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.moduleId}`,
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
      loadSprite: false,
      iconUrl: '/assets/plyr.svg',
    });
  }
}
