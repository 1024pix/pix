import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserAccountPersonalInformationController extends Controller {
  @service intl;
  @service currentDomain;
  @service location;

  @action
  async onLanguageChange(value) {
    if (!this.currentDomain.isFranceDomain) {
      this.location.replace(`/mon-compte/langue?lang=${value}`);
    }
  }
}
