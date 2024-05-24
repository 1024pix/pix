import Component from '@glimmer/component';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';

export default class ModulixFeedback extends Component {
  get type() {
    return this.args.answerIsValid ? 'success' : 'error';
  }

  <template>
    <PixMessage @type={{this.type}} @withIcon={{true}} class="element-qcm-feedback__message">
      {{yield}}
    </PixMessage>
  </template>
}
