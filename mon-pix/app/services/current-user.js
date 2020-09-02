import Service, { inject as service } from '@ember/service';
import get from 'lodash/get';

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
        if (get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
}
