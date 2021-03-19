import Service, { inject as service } from '@ember/service';

import ENV from 'pix-orga/config/environment';

export default class Url extends Service {

  @service currentDomain;
  @service intl;

  definedCampaignsRootUrl = ENV.APP.CAMPAIGNS_ROOT_URL;
  pixAppUrlWithoutExtension = ENV.APP.PIX_APP_URL_WITHOUT_EXTENSION;

  definedHomeUrl = ENV.rootURL;

  get campaignsRootUrl() {
    return this.definedCampaignsRootUrl
      ? this.definedCampaignsRootUrl
      : `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/campagnes/`;
  }

  get homeUrl() {
    const currentLanguage = this.intl.t('current-lang');
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

}
