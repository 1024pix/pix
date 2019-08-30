import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    let url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;
    if (query.tryIfCanImprove) {
      url = url + '?tryImproving=true';
    }
    return url;
  }

});
