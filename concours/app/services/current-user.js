import Service, { inject as service } from '@ember/service';
import _ from 'lodash';

export default Service.extend({

  session: service(),
  store: service(),

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
});
