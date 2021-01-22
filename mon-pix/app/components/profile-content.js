import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ProfileContent extends Component {
  @service currentUser;
  @service intl;
  @service currentDomain;

  get showNewLevelInfo() {
    return !this.currentUser.user.hasSeenNewLevelInfo;
  }

  get newLevelMessage() {
    if ((ENV.APP.FRENCH_NEW_LEVEL_MESSAGE.length < 1 && this.intl.t('current-lang') == 'fr') ||
      (ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE.length < 1 && this.intl.t('current-lang') == 'en')) {
      return null;
    }
    if (this.intl.t('current-lang') == 'en') {
      return ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE;
    } else {
      const french_message = ENV.APP.FRENCH_NEW_LEVEL_MESSAGE;
      if (this.currentDomain.getExtension() === 'org') {
        return french_message.replace('pix.fr', 'pix.org');
      }
      return french_message.replace('pix.org', 'pix.fr');
    }
  }

  get newLevelImageUrl() {
    const rootUrl = ENV.rootURL;
    const rootUrlWithoutLastSlash = rootUrl.replace(/\/$/, '');
    const currentLang = this.intl.t('current-lang');

    return `${rootUrlWithoutLastSlash}/images/Illu_niveau6_${currentLang}.svg`;
  }

  @action
  async closeInformationAboutNewLevel() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenNewLevelInfo: true } });
  }
}
