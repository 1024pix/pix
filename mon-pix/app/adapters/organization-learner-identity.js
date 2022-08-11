import ApplicationAdapter from './application';

export default class OrganizationLearnerIdentity extends ApplicationAdapter {
  urlForQueryRecord() {
    return `${this.host}/${this.namespace}/organization-learners`;
  }
}
