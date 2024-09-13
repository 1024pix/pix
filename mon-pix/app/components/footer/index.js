import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.currentDomain.isFranceDomain;
  }

  get currentYear() {
    const date = new Date();
    return date.getFullYear().toString();
  }
}
