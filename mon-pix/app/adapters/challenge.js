import ApplicationAdapter from './application';

export default class Challenge extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;
    delete query.assessmentId;
    return url;
  }
}
