import Component from '@glimmer/component';
import { t } from 'ember-intl';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';

export default class ModulixAudio extends Component {
  @tracked modalIsOpen = false;

  @action
  showModal() {
    this.modalIsOpen = true;
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }
  get hasTranscription() {
    return this.args.audio.transcription.length > 0;
  }

  <template>
      <div class="element-audio">
        <div class="element-audio__container">
          <div class="element-audio__container__title">{{@audio.title}}</div>
          {{! template-lint-disable require-media-caption }}
          <audio
            controls
            src="{{@audio.url}}"
            ref="audio"
            class="pix-audio-player"
          ></audio>

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
                {{htmlUnsafe @audio.transcription}}
              </:content>
            </PixModal>
          {{/if}}

        </div>
      </div>

  </template>
}
