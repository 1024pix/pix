import ApplicationAdapter from './application';
import { resolve } from 'rsvp';

export default ApplicationAdapter.extend({

  // refresh cache
  refreshRecord(type, challenge) {
    const url = `${this.host}/${this.namespace}/cache`;
    const payload = {
      'cache-key': `Épreuves_${challenge.challengeId}`
    };
    return this.ajax(url, 'DELETE', { data: payload });
  }
});
