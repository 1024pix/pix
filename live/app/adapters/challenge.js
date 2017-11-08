import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  queryRecord(store, type, query) {
    let url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;
    if (query.challengeId) {
      url += `/${query.challengeId}`;
    }
    return this.ajax(url, 'GET');
  }

});
