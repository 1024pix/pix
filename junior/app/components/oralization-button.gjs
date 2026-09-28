import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class OralizationButton extends Component {
  @tracked isSpeaking = false;
  @service intl;

  get oralizationIconName() {
    return this.isSpeaking ? 'stopCircle' : 'hearing';
  }

  get oralizationButtonLabel() {
    return this.intl.t(this.isSpeaking ? 'components.oralization-button.stop' : 'components.oralization-button.play');
  }

  get isReadingClass() {
    if (this.isSpeaking) {
      return 'oralization-container--is-reading';
    }
    return '';
  }

  @action
  readText() {
    const text = this.args.text;

    if (!text) {
      return;
    }

    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    window.speechSynthesis.cancel();

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.lang = 'fr-FR';
    utterance.pitch = 0.8;
    utterance.rate = 0.8;
    utterance.text = text;

    window.speechSynthesis.speak(utterance);
  }

  <template>
    <div class="oralization-container {{this.isReadingClass}}">
      <PixButton
        aria-label={{t "components.oralization-button.label"}}
        @variant="tertiary"
        @triggerAction={{this.readText}}
      >
        <PixIcon @name={{this.oralizationIconName}} />
      </PixButton>
      {{this.oralizationButtonLabel}}
    </div>
  </template>
}
