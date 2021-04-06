import Service, { inject as service } from '@ember/service';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  _user = undefined;

  get user() {
    return this._user;
  }

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this._user = await this.store.queryRecord('user', { me: true });
      }
      catch (error) {
        this._user = null;
        return this.session.invalidate();
      }
    }
  }
}
