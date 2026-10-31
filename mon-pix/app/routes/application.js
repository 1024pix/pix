import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';
import { formats } from 'mon-pix/ember-intl';
import PlausibleAdapter from 'mon-pix/metrics-adapters/plausible-adapter';

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
  @service currentUser;
  @service locale;
  @service metrics;

  constructor() {
    super(...arguments);

    this.metrics.activateAdapters([
      {
        name: 'PlausibleAdapter',
        adapter: PlausibleAdapter,
        environments: ENV.ANALYTICS.ENABLED ? ['all'] : [],
        config: {
          siteId: ENV.ANALYTICS.SITE_ID,
          scriptUrl: ENV.ANALYTICS.SCRIPT_URL,
        },
      },
    ]);
  }

  activate() {
    this.splash.hide();

    const trackRouteChange = (transition) => {
      if (!transition.to || transition.to.metadata?.doNotTrackPage) {
        return;
      }
      this.pixMetrics.trackPage();
    };
    this.router.on('routeDidChange', trackRouteChange);
  }

  async beforeModel(transition) {
    await this.featureToggles.load().catch();

    const queryParams = transition?.to?.queryParams;
    this.intl.setFormats(formats);
    this.locale.setBestLocale({ queryParams });
    await this.session.setup();
    await this.oidcIdentityProviders.load().catch();
    await this.authentication.handleAnonymousAuthentication(transition);
    await this.currentUser.load();
  }

  async model() {
    let informationBanner = null;
    if (!ENV.APP.MAINTENANCE_ONGOING) {
      informationBanner = await this.store.findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`);
    }
    return {
      headElement: document.querySelector('head'),
      informationBanner,
    };
  }

  afterModel() {
    if (!ENV.APP.MAINTENANCE_ONGOING) {
      this.poller = setInterval(async () => {
        try {
          this.store.findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`);
        } catch {
          this.#stopPolling();
        }
      }, ENV.APP.INFORMATION_BANNER_POLLING_TIME);
    }
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
