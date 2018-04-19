import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  // refresh cache
  refreshRecord(type, challenge) {
    const url = `${this.host}/${this.namespace}/challenges/${challenge.challengeId}/solution`;
    return this.ajax(url, 'POST');
  }

});
