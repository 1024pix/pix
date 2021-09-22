import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  @service featureToggles;
  @service session;

  async beforeModel(transition) {
    await this.featureToggles.load();
    const lang = transition.to.queryParams.lang;
    return this.session.handlePrescriberLanguageAndLocale(lang);
  }
}
