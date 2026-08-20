import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { formats } from 'pix-admin/ember-intl';

export default class ApplicationRoute extends Route {
  @service session;
  @service featureToggles;
  @service currentUser;
  @service locale;
  @service intl;
  @service pixMetrics;
  @service router;

  constructor() {
    super(...arguments);

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
