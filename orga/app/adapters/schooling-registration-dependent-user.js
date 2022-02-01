import ApplicationAdapter from './application';

export default class SchoolingRegistrationDependentUserAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.generateUsernameAndTemporaryPassword) {
      delete adapterOptions.generateUsernameAndTemporaryPassword;
      return url + '/generate-username-password';
    }

    return `${this.host}/${this.namespace}/schooling-registration-dependent-users/password-update`;
  }
}
