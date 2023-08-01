import ApplicationAdapter from './application';

export default class ActivityAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/current-activity`;
    delete query.assessmentId;
    return url;
  }
}
