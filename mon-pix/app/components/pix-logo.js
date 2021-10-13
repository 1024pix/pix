import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PixLogo extends Component {
  @service featureToggles;

  get isHalloween() {
    return this.featureToggles.featureToggles.isHalloweenEnabled;
  }

  get logo() {
    if (this.isHalloween) {
      return '/images/pix-logo-halloween.svg';
    }
    return '/images/pix-logo.svg';
  }
}
