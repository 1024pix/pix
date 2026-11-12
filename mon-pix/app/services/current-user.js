import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  @tracked user;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.user = await this.store.queryRecord('user', { me: true });
      } catch {
        this.user = null;
        return this.session.invalidate();
      }
    }
  }
}
