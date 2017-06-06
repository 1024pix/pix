import RSVP from 'rsvp';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({

  restore(data) {
    return RSVP.resolve(data);
  },

  authenticate(username) {
    // Un promise qui dit si OUI ou NON on est authentifie
    return RSVP.resolve({ username });
  }

});
