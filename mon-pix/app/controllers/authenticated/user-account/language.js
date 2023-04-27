import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserAccountPersonalInformationController extends Controller {
  @service currentUser;
  @service dayjs;
  @service intl;
  @service currentDomain;

  @action
  async onLanguageChange(language) {
    if (!this.currentDomain.isFranceDomain) {
      this.intl.setLocale([language]);
      this.dayjs.setLocale(language);

      await this.currentUser.user.save({ adapterOptions: { lang: language } });
    }
  }
}
