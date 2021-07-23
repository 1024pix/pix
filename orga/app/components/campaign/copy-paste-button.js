import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CopyPasteButton extends Component {
  @tracked tooltipText;

  constructor() {
    super(...arguments);
    this.tooltipText = this.args.defaultMessage;
  }

  @action
  onClipboardSuccess() {
    this.tooltipText = this.args.successMessage;
  }

  @action
  onClipboardOut() {
    this.tooltipText = this.args.defaultMessage;
  }
}
