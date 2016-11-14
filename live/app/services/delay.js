import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Service.extend({
  ms(ms) {
    /* istanbul ignore if  */
    if (EmberENV.useDelay) { //unreachable by tests
      return new RSVP.Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
    // test-only, to avoid test to take too long
    return new RSVP.resolve(); 
  }
});
