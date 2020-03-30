import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class Challenge extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/assessments/${query.assessmentId}/next`;
    delete query.assessmentId;
    return url;
  }
}
