import ApplicationAdapter from './application';

export default class DependentUserAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    if (adapterOptions && adapterOptions.generateUsernameAndTemporaryPassword) {
      delete adapterOptions.generateUsernameAndTemporaryPassword;
      return `${this.host}/${this.namespace}/sco-organization-learners/username-password-generation`;
    }

    return `${this.host}/${this.namespace}/sco-organization-learners/password-update`;
  }
}
