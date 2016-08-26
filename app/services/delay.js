import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Service.extend({
  ms(ms) {
    if (EmberENV.useDelay) {
      return new RSVP.Promise((resolve) => {
        setTimeout(resolve, ms)
      });
    }
    else
      return new RSVP.resolve()
  }
});
