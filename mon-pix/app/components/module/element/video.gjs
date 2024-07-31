import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';
import Plyr from 'plyr';

import player_fr from '../plyr-translation/player_fr';

export default class ModulixVideoElement extends Component {
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
    this.args.openTranscription(this.args.video.id);
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

  <template>
    <div class="element-video">
      <div class="element-video__container">
        {{! template-lint-disable require-media-caption }}
        <video
          {{didInsert this.launchPlyr}}
          id={{@video.id}}
          ref="video"
          class="pix-video-player"
          playsinline
          controls
          crossorigin
          data-poster={{@video.poster}}
        >
          <source src={{@video.url}} type="video/mp4" />
          {{#if this.hasSubtitles}}
            <track kind="captions" label="Français" src={{@video.subtitles}} srclang="fr" default />
          {{/if}}
        </video>
      </div>

      {{#if this.hasTranscription}}
        <PixButton @variant="tertiary" @triggerAction={{this.showModal}}>
          {{t "pages.modulix.buttons.element.transcription"}}
        </PixButton>
        <PixModal
          @title={{t "pages.modulix.modals.transcription.title"}}
          @showModal={{this.modalIsOpen}}
          @onCloseButtonClick={{this.closeModal}}
        >
          <:content>
            {{htmlUnsafe @video.transcription}}
          </:content>
        </PixModal>
      {{/if}}
    </div>
  </template>
}
