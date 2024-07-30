import { action } from '@ember/object';
import Component from '@glimmer/component';
import * as markdownConverter from 'junior/utils/markdown-converter';

export default class RobotDialog extends Component {
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
  get getRobotImageUrl() {
    return `/images/robot/dialog-robot-${this.args.class ? this.args.class : 'default'}.svg`;
  }

  <template>
    <div class="robot-speaking">
      <img class="robot-speaking__logo" alt="mascotte pix1d" src={{this.getRobotImageUrl}} />
      <div class="bubbles">
        {{yield}}
      </div>
    </div>
  </template>
}

// {{!--  {{!  À activer quand le design + fonctionnalité sont actés }}--}}
// {{!--  {{!  <PixIconButton}}--}}
// {{!--  {{!    @ariaLabel="Lire la consigne à haute voix"}}--}}
// {{!--  {{!    @withBackground="true"}}--}}
// {{!--  {{!    @icon="volume-high"}}--}}
// {{!--  {{!--    @triggerAction={{fn this.readTheInstruction @instruction}}--}}
//   {{!--  {{!  />}}--}}
//     {{!</div>}}
