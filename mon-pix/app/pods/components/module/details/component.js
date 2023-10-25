import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleDetails extends Component {
  @action
  continueToNextGrain() {
    // eslint-disable-next-line no-console
    console.info('Continue to next grain');
  }

  @action
  radioClicked(value) {
    // eslint-disable-next-line no-console
    console.info(value);
  }
}
