import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

function waitForElement(id) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      return resolve(document.getElementById(id));
    }

    const observer = new MutationObserver(() => {
      if (document.getElementById(id)) {
        resolve(document.getElementById(id));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export default class InElement extends Component {
  @tracked destinationElement;

  constructor() {
    super(...arguments);
    if (this.args.waitForElement) {
      waitForElement(this.args.destinationId).then((element) => {
        this.destinationElement = element;
      });
    } else {
      this.destinationElement = document.getElementById(this.args.destinationId);
    }
  }
}
