import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service currentUser;
  @service featureToggles;
  @service intl;

  async beforeModel() {
    await this.featureToggles.load();
    this.intl.setLocale(['fr']);
    return this._loadCurrentUser();
  }

  _loadCurrentUser() {
    return this.currentUser.load();
  }
}
