import Component from '@glimmer/component';

import { htmlUnsafe } from '../../helpers/html-unsafe';

export default class ModulixFeedback extends Component {
  get type() {
    return this.args.answerIsValid ? 'success' : 'error';
  }

  get state() {
    return this.args.feedback.state;
  }

  get diagnosis() {
    return this.args.feedback.diagnosis;
  }

  <template>
    <div class="feedback feedback--{{this.type}}">
      <span class="feedback__state"> {{this.state}} </span>
      {{htmlUnsafe this.diagnosis}}
    </div>
  </template>
}
