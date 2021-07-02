import ApplicationAdapter from './application';

export default class StudentInformationAdapter extends ApplicationAdapter {

  buildURL(
    modelName,
    id,
    snapshot,
    requestType,
    query,
  ) {
    if (requestType === 'recover-account') {
      return `${this.host}/${this.namespace}/schooling-registration-dependent-users/`;
    } else {
      return super.buildURL(
        modelName,
        id,
        snapshot,
        requestType,
        query,
      );
    }
  }
}
