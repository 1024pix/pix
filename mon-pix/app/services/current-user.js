import Service, { service } from '@ember/service';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  #user;

  get user() {
    return this.#user;
  }

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.#user = await this.store.queryRecord('user', { me: true });
      } catch {
        this.#user = null;
        return this.session.invalidate();
      }
    }
  }
}
