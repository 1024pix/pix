import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { formats } from 'pix-admin/ember-intl';

export default class ApplicationRoute extends Route {
  @service config;
  @service session;
  @service featureToggles;
  @service currentUser;
  @service locale;
  @service intl;

  async beforeModel(transition) {
    await this.config.load();

    const queryParams = transition?.to?.queryParams;
    this.intl.setFormats(formats);
    this.locale.setBestLocale({ queryParams });
    await this.session.setup();
    await this.featureToggles.load();
    await this.currentUser.load();
  }
}
