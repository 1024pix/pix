import classic from 'ember-classic-decorator';
import Service, { inject as service } from '@ember/service';
import _ from 'lodash';

@classic
export default class CurrentUserService extends Service {
  @service session;

  @service store;

  async load() {
    if (this.get('session.isAuthenticated')) {
      try {
        const user = await this.store.queryRecord('user', { me: true });

        this.set('user', user);
      }
      catch (error) {
        if (_.get(error, 'errors[0].code') === 401) {
          return this.session.invalidate();
        }
      }
    }
  }
}
