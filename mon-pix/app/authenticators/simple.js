import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({

  ajax: service(),

  restore(data) {
    return RSVP.resolve(data);
  },

  authenticate({ email, password, token }) {
    if (token) {
      const userId = this.extractDataFromToken(token).user_id;
      const source = this.extractDataFromToken(token).source;
      return RSVP.resolve({ token, userId, source });
    }

    return this.ajax.request('/api/authentications', {
      method: 'POST',
      data: JSON.stringify({
        data: {
          attributes: {
            password,
            email
          }
        }
      })
    }).then((payload) => {
      const token = payload.data.attributes.token;
      const userId = this.extractDataFromToken(token).user_id;
      const source = this.extractDataFromToken(token).source;

      return RSVP.Promise.resolve({
        token: payload.data.attributes.token,
        userId,
        source
      });
    });
  },

  extractDataFromToken(token) {
    const payloadOfToken = token.split('.')[1];
    return JSON.parse(atob(payloadOfToken));
  }
});
