import ApplicationAdapter from './application';

export default class StudentInformationAdapter extends ApplicationAdapter {
  buildURL(modelName, id, snapshot, requestType, query) {
    if (requestType === 'account-recovery') {
      return `${this.host}/${this.namespace}/sco-organization-learners/`;
    } else {
      return super.buildURL(modelName, id, snapshot, requestType, query);
    }
  }
}
