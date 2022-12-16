import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ProfileController extends Controller {
  @service intl;

  get pageTitle() {
    return this.intl.t('pages.profiles-individual-results.title', {
      firstName: this.model.campaignProfile.firstName,
      lastName: this.model.campaignProfile.lastName,
    });
  }
}
