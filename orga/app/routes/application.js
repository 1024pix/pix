import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'pix-orga/config/environment';
import { formats } from 'pix-orga/ember-intl';
import PlausibleAdapter from 'pix-orga/metrics-adapters/plausible-adapter';

export default class ApplicationRoute extends Route {
  @service store;
  @service featureToggles;
  @service currentDomain;
  @service session;
  @service locale;
  @service oidcIdentityProviders;
  @service pixMetrics;
  @service router;
  @service intl;
  @service localeLoader;
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

    const trackRouteChange = (transition) => {
      if (!transition.to || transition.to.metadata?.doNotTrackPage) {
        return;
      }
      this.pixMetrics.trackPage();
    };
    this.router.on('routeDidChange', trackRouteChange);
  }

  async beforeModel(transition) {
    await this.featureToggles.load();

    const queryParams = transition?.to?.queryParams;
    this.intl.setFormats(formats);
    this.locale.setBestLocale({ queryParams });

    await this.session.setup();
    await this.oidcIdentityProviders.load().catch();

    await this.localeLoader.load(this.locale.currentLocale);
  }

  async model() {
    const informationBanner = await this.store.findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`);
    return {
      title: this.currentDomain.isFranceDomain ? 'Pix Orga (France)' : 'Pix Orga (hors France)',
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
  error() {
    this.#stopPolling();
    return true;
  }

  #stopPolling() {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }
}
