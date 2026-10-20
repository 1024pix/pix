import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'pix-admin/config/environment';
import { formats } from 'pix-admin/ember-intl';
import PlausibleAdapter from 'pix-admin/metrics-adapters/plausible-adapter';

export default class ApplicationRoute extends Route {
  @service session;
  @service featureToggles;
  @service currentUser;
  @service locale;
  @service intl;
  @service pixMetrics;
  @service router;
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
    await this.currentUser.load();
  }
}
