import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  shouldBackgroundReloadRecord() {
    return false;
  },

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${this._super(...arguments)}/me`;
    }

    if (query.passwordResetTemporaryKey) {
      const temporaryKey = query.passwordResetTemporaryKey;
      delete query.passwordResetTemporaryKey;
      return `${this.host}/${this.namespace}/password-reset-demands/${temporaryKey}`;
    }

    return this._super(...arguments);
  },

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.rememberUserHasSeenAssessmentInstructions) {
      delete adapterOptions.rememberUserHasSeenAssessmentInstructions;
      return url + '/remember-user-has-seen-assessment-instructions';
    }

    if (adapterOptions && adapterOptions.updatePassword) {
      delete adapterOptions.updatePassword;
      const temporaryKey = adapterOptions.temporaryKey;
      delete adapterOptions.temporaryKey;
      return url + `/password-update?temporary-key=${encodeURIComponent(temporaryKey)}`;
    }

    return url;
  },
});
