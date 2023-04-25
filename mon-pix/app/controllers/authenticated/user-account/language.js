import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserAccountPersonalInformationController extends Controller {
  @service intl;
  @service url;
  @service location;

  @action
  async onChangeLang(value) {
    if (!this.url.isFrenchDomainExtension) {
      this.location.replace(`/mon-compte/langue?lang=${value}`);
    }
  }
}
