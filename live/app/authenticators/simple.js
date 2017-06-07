import RSVP from 'rsvp';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({

  restore(data) {
    return RSVP.resolve(data);
  },

  authenticate(token) {
    return RSVP.resolve({ token });
  }

});
