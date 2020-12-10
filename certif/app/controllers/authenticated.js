import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';

export default class AuthenticatedController extends Controller {

  @tracked isBannerVisible = true;
  @service currentUser;

  get showBanner() {
    return this.currentUser.isFromSco && this.isBannerVisible;
  }

  get documentationLink() {
    if (this.model.isSco) {
      return LINK_SCO;
    }
    return LINK_OTHER;
  }

  @action
  async closeBanner() {
    this.isBannerVisible = false;
  }
}
