import Component from '@glimmer/component';

import { htmlUnsafe } from '../../helpers/html-unsafe';

export default class ModulixFeedback extends Component {
  get type() {
    return this.args.answerIsValid ? 'success' : 'error';
  }

  <template>
    <div class="feedback feedback--{{this.type}}">
      {{#if @feedback.state}}
        <div class="feedback__state">{{htmlUnsafe @feedback.state}}</div>
      {{/if}}
      {{htmlUnsafe @feedback.diagnosis}}
    </div>
  </template>
}
