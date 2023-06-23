import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class UserAccountPersonalInformationController extends Controller {
  @service currentUser;
  @service currentDomain;
  @service locale;

  @tracked shouldDisplayLanguageUpdatedMessage = false;

  @action
  async onLanguageChange(language) {
    if (!this.currentDomain.isFranceDomain) {
      await this.currentUser.user.save({ adapterOptions: { lang: language } });

      this.locale.setLocale(language);
      this._displayLanguageUpdatedMessage();
    }
  }

  _displayLanguageUpdatedMessage() {
    this.shouldDisplayLanguageUpdatedMessage = true;
  }
}
