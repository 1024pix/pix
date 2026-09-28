import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';

export default class ModulixVideoElement extends Component {
  @tracked modalIsOpen = false;
  @service passageEvents;

  videoWasStarted = false;

  get hasSubtitles() {
    return this.args.video.subtitles.length > 0;
  }

  get hasTranscription() {
    return this.args.video.transcription.length > 0;
  }

  @action
  showModal() {
    this.modalIsOpen = true;
    this.args.onTranscriptionOpen(this.args.video.id);
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  @action
  onPlay() {
    if (this.videoWasStarted) {
      return;
    }
    this.videoWasStarted = true;

    this.passageEvents.record({
      type: 'VIDEO_PLAYED',
      data: {
        elementId: this.args.video.id,
      },
    });
  }

  <template>
    <div class="element-video">
      <div class="element-video__container">
        {{! template-lint-disable require-media-caption }}
        <video
          id={{@video.id}}
          ref="video"
          class="pix-video-player"
          playsinline
          controls
          crossorigin
          poster={{@video.poster}}
          {{on "play" this.onPlay}}
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
