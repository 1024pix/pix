import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  shouldBackgroundReloadRecord() {
    return false;
  },

  urlForCreateRecord(query, { adapterOptions }) {
    const url = this._super(...arguments);
    if (adapterOptions && adapterOptions.isStudentDependentUser) {
      return `${this.host}/${this.namespace}/student-dependent-users`;
    }

    return url;
  },

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;
    if (adapterOptions && adapterOptions.isStudentDependentUser) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const serializedUser = this.serialize(snapshot);
      serializedUser.data.attributes['campaign-code'] = adapterOptions.campaignCode;
      serializedUser.data.attributes.birthdate = adapterOptions.birthdate;
      serializedUser.data.attributes['with-username'] = adapterOptions.withUsername;
      return this.ajax(url, 'POST', { data: serializedUser });
    }
    return this._super(...arguments);
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
