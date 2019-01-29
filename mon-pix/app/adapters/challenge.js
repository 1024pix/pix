import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  queryRecord(store, type, query) {
    const url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;
    return this.ajax(url, 'GET');
  }

});
