import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    let url;
    if (query.tryIfCanImprove) {
      url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next?tryImproving=true`;
    } else {
      url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;
    }
    return url;
  }

});
