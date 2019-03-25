import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  // refresh cache
  refreshRecord(type, challenge) {
    const url = `${this.host}/cache`;
    const payload = {
      'cache-key': `Épreuves_${challenge.challengeId}`
    };
    return this.ajax(url, 'DELETE', { data: payload });
  }
});
