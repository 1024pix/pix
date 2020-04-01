import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CongratulationsCertificationBanner extends Component {

  tagName = '';
  isVisible = null;

  @action
  closeBanner() {
    this.closeBanner();
  }
}
