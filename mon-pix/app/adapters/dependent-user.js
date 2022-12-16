import ApplicationAdapter from './application';

export default class DependentUser extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/sco-organization-learners/dependent`;
  }
}
