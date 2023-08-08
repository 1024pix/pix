import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as markdownConverter from '1d/utils/markdown-converter';

export default class ChallengeInstruction extends Component {
  @action
  readTheInstruction(text) {
    if (!window.speechSynthesis.speaking) {
      const utterance = new SpeechSynthesisUtterance();

      const parser = new DOMParser();
      const parsedText = parser.parseFromString(markdownConverter.toHTML(text), 'text/html').body.innerText;
      utterance.text = parsedText;
      utterance.lang = 'fr-FR';

      window.speechSynthesis.speak(utterance);
    }
  }
}
