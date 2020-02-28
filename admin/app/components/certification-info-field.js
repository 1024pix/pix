import { computed } from '@ember/object';
import Component from '@glimmer/component';

export default class CertificationInfoField extends Component {

  large = false;

  // Computed properties
  @computed('large')
  get leftWidth() {
    const large = this.large;
    if (large) {
      return 'col-sm-3';
    } else {
      return 'col-sm-5';
    }
  }

  @computed('large')
  get rightWidth() {
    const large = this.large;
    if (large) {
      return 'col-sm-9';
    } else {
      return 'col-sm-7';
    }
  }
}
