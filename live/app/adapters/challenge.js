import ApplicationAdapter from './application';
import RSVP from 'rsvp';

export default ApplicationAdapter.extend({

  queryNext(store, assessmentId, challengeId) {
    const currentChallengeSuffix = challengeId ? `/${challengeId}` : '';
    const url = `${this.host}/${this.namespace}/assessments/${assessmentId}/next${currentChallengeSuffix}`;

    return this.ajax(url, 'GET').then(payload => {
      let challenge = null;
      if (payload) {
        challenge = store.push(payload);
      }
      return RSVP.resolve(challenge);
    });
  }

});
