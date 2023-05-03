import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserAccountPersonalInformationController extends Controller {
  @service currentUser;
  @service dayjs;
  @service intl;
  @service currentDomain;
  @service locale;

  @action
  async onLanguageChange(language) {
    if (!this.currentDomain.isFranceDomain) {
      await this.currentUser.user.save({ adapterOptions: { lang: language } });

      this.locale.setLocale(language);
    }
  }
}
