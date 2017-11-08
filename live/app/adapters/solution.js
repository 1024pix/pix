import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  queryRecord(store, type, query) {
    const url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/solutions/${query.answerId}`;
    return this.ajax(url, 'GET');
  },

  // refresh cache
  refreshRecord(type, challenge) {
    const url = `${this.host}/${this.namespace}/challenges/${challenge.challengeId}/solution`;
    return this.ajax(url, 'POST');
  }

});
