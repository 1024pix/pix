import Service from '@ember/service';
import RSVP from 'rsvp';
import config from '../config/environment';

export default Service.extend({
  ms(ms) {
    /* istanbul ignore if  */
    if (config.EmberENV.useDelay) { //unreachable by tests
      return new RSVP.Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
    // test-only, to avoid test to take too long
    return new RSVP.resolve();
  }
});
