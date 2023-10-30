import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleQcu extends Component {
  @action
  radioClicked(value) {
    // eslint-disable-next-line no-console
    console.info(value);
  }
}
