import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ChallengeInstruction extends Component {
  @action
  readTheInstruction() {
    if (!window.speechSynthesis.speaking) {
      const utterance = new SpeechSynthesisUtterance();

      utterance.text = document.getElementsByClassName('challenge-instruction')[0].innerText;
      utterance.lang = 'fr-FR';

      window.speechSynthesis.speak(utterance);
    }
  }
}
