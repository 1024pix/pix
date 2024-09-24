import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service authentication;
  @service featureToggles;
  @service intl;
  @service oidcIdentityProviders;
  @service session;
  @service splash;
  @service metrics;

  activate() {
    this.splash.hide();
  }

  async beforeModel(transition) {
    this.metrics.initialize();
    await this.session.setup();

    await this.featureToggles.load().catch();

    await this.oidcIdentityProviders.load().catch();

    await this.authentication.handleAnonymousAuthentication(transition);

    await this.session.handleUserLanguageAndLocale(transition);
  }

  model() {
    return {
      headElement: document.querySelector('head'),
    };
  }

  @action
  error(error) {
    const isUnauthorizedError = error?.errors?.some((err) => err.status === '401');
    return !isUnauthorizedError;
  }
}
