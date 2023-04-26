import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  @service featureToggles;
  @service currentDomain;
  @service currentUser;
  @service session;

  async beforeModel(transition) {
    await this.featureToggles.load();
    const isFranceDomain = this.currentDomain.isFranceDomain;
    const localeFromQueryParam = transition.to.queryParams.lang;
    await this.currentUser.load();
    const userLocale = this.currentUser.prescriber?.lang;
    await this.session.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });
  }
}
