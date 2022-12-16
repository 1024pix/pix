import ApplicationAdapter from './application';

export default class ExternalUser extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/sco-organization-learners/external`;
  }
}
