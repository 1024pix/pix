import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    let url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;

    if (query.assessmentId) {
      delete query.assessmentId;
    }

    if (query.tryIfCanImprove) {
      delete query.tryIfCanImprove;
      url = url + '?tryImproving=true';
    }

    return url;
  },

});
