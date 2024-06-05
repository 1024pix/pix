import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class AssessmentBanner extends Component {
  @service intl;
  @service featureToggles;

  @tracked showClosingModal = false;

  get textToSpeechIcon() {
    return this.args.isTextToSpeechActivated ? 'volume-high' : 'volume-xmark';
  }

  get textToSpeechTooltipText() {
    return this.args.isTextToSpeechActivated
      ? this.intl.t('pages.challenge.statement.text-to-speech.deactivate')
      : this.intl.t('pages.challenge.statement.text-to-speech.activate');
  }

  get showTextToSpeechActivationButton() {
    return (
      this.featureToggles.featureToggles?.isTextToSpeechButtonEnabled &&
      this.args.displayTextToSpeechActivationButton &&
      window.speechSynthesis
    );
  }

  @action toggleClosingModal() {
    this.showClosingModal = !this.showClosingModal;
  }
}
