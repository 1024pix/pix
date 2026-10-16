import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'pix-certif/config/environment';
import { formats } from 'pix-certif/ember-intl';
import PlausibleAdapter from 'pix-certif/metrics-adapters/plausible-adapter';

export default class ApplicationRoute extends Route {
  @service featureToggles;
  @service currentDomain;
  @service currentUser;
  @service locale;
  @service session;
  @service store;
  @service intl;
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

  async beforeModel(transition) {
    await this.featureToggles.load();

    const queryParams = transition?.to?.queryParams;
    this.intl.setFormats(formats);
    this.locale.setBestLocale({ queryParams });
    await this.session.setup();
    await this.currentUser.load();
  }

  async model() {
    const informationBanner = await this.store.findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`);
    return {
      title: this.currentDomain.isFranceDomain ? 'Pix Certif (France)' : 'Pix Certif (hors France)',
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
