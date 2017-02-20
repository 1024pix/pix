import ApplicationAdapter from './application';
import RSVP from 'rsvp';

export default ApplicationAdapter.extend({

  queryNext(store, assessmentId) {
    return this.ajax(`${this.host}/${this.namespace}/assessments/${assessmentId}/next`, 'GET').then(payload => {
      let challenge = null;
      if (payload) {
        challenge = store.push(payload);
      }
      return RSVP.resolve(challenge);
    });
  }

});
