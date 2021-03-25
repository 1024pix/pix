import ApplicationAdapter from './application';

export default class SchoolingRegistrationAdapter extends ApplicationAdapter {

  urlForDeleteRecord(id) {
    return `${this.host}/${this.namespace}/schooling-registration-user-associations/${id}`;
  }
}
