import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({

  ajax: service(),

  restore(data) {
    return RSVP.resolve(data);
  },

  authenticate(email, password) {
    return this.get('ajax').request('/api/authentications', {
      method: 'POST',
      data: JSON.stringify({
        data: {
          attributes: {
            password,
            email
          }
        }
      })
    }).then(payload => {
      return RSVP.Promise.resolve({
        token: payload.data.attributes.token,
        userId: payload.data.attributes['user-id']
      });
    });
  }

});
