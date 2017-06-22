import RSVP from 'rsvp';
import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';

export default Base.extend({

  ajax: Ember.inject.service(),

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
