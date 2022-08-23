import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service splash;
  @service session;
  @service intl;
  @service headData;
  @service featureToggles;
  @service oidcIdentityProviders;

  activate() {
    this.splash.hide();
  }

  async beforeModel(transition) {
    this.headData.description = this.intl.t('application.description');

    await this.featureToggles.load().catch();

    await this.oidcIdentityProviders.load().catch();

    await this.session.handleUserLanguageAndLocale(transition);
  }
}
