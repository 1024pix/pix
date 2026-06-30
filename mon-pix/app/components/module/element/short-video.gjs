import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';

import ModuleElement from './module-element';

export default class ModulixShortVideoElement extends ModuleElement {
  @tracked modalIsOpen = false;
  @tracked videoHasError = false;
  @service passageEvents;
  @service pixMetrics;

  get shouldShowFallback() {
    return !this.args.element?.url || this.videoHasError;
  }

  @action
  onVideoError(event) {
    event.stopPropagation();
    this.videoHasError = true;
  }

  @action
  showModal() {
    this.modalIsOpen = true;

    this.passageEvents.record({
      type: 'SHORT_VIDEO_TRANSCRIPTION_OPENED',
      data: {
        elementId: this.args.element.id,
      },
    });

    this.pixMetrics.trackEvent('Clic sur le bouton transcription d’une vidéo courte', {
      category: 'Modulix',
      elementId: this.args.element.id,
    });
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  get hasTranscriptionText() {
    return Boolean(this.args.element.transcription);
  }

  <template>
    <div class="element-short-video">
      {{#if this.shouldShowFallback}}
        <div class="element-short-video__missing-content" role="status">
          <p>{{t "pages.modulix.elements.short-video.missing-content"}}</p>
          <p>{{t "pages.modulix.elements.short-video.consult-transcription"}}</p>
        </div>
      {{else}}
        <video
          class="element-short-video__video"
          autoplay
          loop
          muted={{true}}
          src={{@element.url}}
          {{on "error" this.onVideoError}}
        ></video>
      {{/if}}
      {{#if this.hasTranscriptionText}}
        <PixButton @variant="tertiary" @triggerAction={{this.showModal}}>
          {{t "pages.modulix.buttons.element.transcription"}}
        </PixButton>
      {{/if}}
      <PixModal
        @title={{t "pages.modulix.modals.transcription.title"}}
        @showModal={{this.modalIsOpen}}
        @onCloseButtonClick={{this.closeModal}}
      >
        <:content>
          {{htmlUnsafe @element.transcription}}
        </:content>
      </PixModal>
    </div>
  </template>
}
