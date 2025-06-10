import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ApplicationRoute extends Route {
  @service authentication;
  @service featureToggles;
  @service intl;
  @service oidcIdentityProviders;
  @service session;
  @service splash;
  @service pixMetrics;
  @service store;
  @service router;
  @service benjamin;

  constructor() {
    super(...arguments);

    this.benjamin.hello();

    const trackRouteChange = (transition) => {
      if (!transition.to || transition.to.metadata?.doNotTrackPage) {
        return;
      }
      this.pixMetrics.trackPage();
    };
    this.router.on('routeDidChange', trackRouteChange);
  }

  activate() {
    this.splash.hide();
  }

  async beforeModel(transition) {
    await this.session.setup();

    await this.featureToggles.load().catch();

    await this.oidcIdentityProviders.load().catch();

    await this.authentication.handleAnonymousAuthentication(transition);

    await this.session.handleUserLanguageAndLocale(transition);
  }

  async model() {
    const informationBanner = await this.store.findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`);
    return {
      headElement: document.querySelector('head'),
      informationBanner,
    };
  }

  afterModel() {
    this.poller = setInterval(async () => {
      try {
        this.store.findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`);
      } catch {
        this.#stopPolling();
      }
    }, ENV.APP.INFORMATION_BANNER_POLLING_TIME);
  }

  deactivate() {
    this.#stopPolling();
  }

  @action
  error(error) {
    this.#stopPolling();

    const has403WithHTMLContentTypeError = () => {
      return error?.errors?.some((err) => err.status === '403') && error?.error.includes('Payload (text/html;');
    };

    const isUnauthorizedError = has403WithHTMLContentTypeError() || error?.errors?.some((err) => err.status === '401');
    return !isUnauthorizedError;
  }

  #stopPolling() {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }
}
