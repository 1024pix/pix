import Service, { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';

export default Service.extend({

  session: service(),
  store: service(),

  user: computed(function() {
    return this._userPromise;
  }).readOnly(),

  load() {
    const userId = this.get('session.data.authenticated.user_id');

    if (isEmpty(userId)) {
      return resolve();
    }

    return (this._userPromise = this.get('store').findRecord('user', userId));
  }

});
