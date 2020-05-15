import _ from 'lodash';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @tracked user;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.user = await this.store.queryRecord('user', { me: true });
      } catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
}
