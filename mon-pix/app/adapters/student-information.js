import ApplicationAdapter from './application';

export default class StudentInformationAdapter extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/schooling-registration-dependent-users/recover-account`;
  }
}
