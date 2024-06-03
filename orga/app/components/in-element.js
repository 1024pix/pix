import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class InElement extends Component {
  @tracked destinationElement;
  @service elementHelper;

  constructor() {
    super(...arguments);
    if (this.args.waitForElement) {
      this.elementHelper.waitForElement(this.args.destinationId).then((element) => {
        this.destinationElement = element;
      });
    } else {
      this.destinationElement = document.getElementById(this.args.destinationId);
    }
  }
}
