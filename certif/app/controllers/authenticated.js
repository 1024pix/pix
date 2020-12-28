import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';

export default class AuthenticatedController extends Controller {

  @tracked isBannerVisible = true;
  @service router;

  get showBanner() {
    const isOnFinalizationPage = this.router.currentRouteName === 'authenticated.sessions.finalize';
    return this.model.isScoManagingStudents && this.isBannerVisible && !isOnFinalizationPage;
  }

  get documentationLink() {
    if (this.model.isScoManagingStudents) {
      return LINK_SCO;
    }
    return LINK_OTHER;
  }

  @action
  async closeBanner() {
    this.isBannerVisible = false;
  }
}
