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

    return this._super(...arguments);
  },

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.rememberUserHasSeenAssessmentInstructions) {
      delete adapterOptions.rememberUserHasSeenAssessmentInstructions;
      return url + '/remember-user-has-seen-assessment-instructions';
    }

    if (adapterOptions && adapterOptions.rememberUserHasSeenNewProfileInfo) {
      delete adapterOptions.rememberUserHasSeenNewProfileInfo;
      return url + '/remember-user-has-seen-new-profile-info';
    }

    if (adapterOptions && adapterOptions.temporaryKey) {
      return url + `?temporary-key=${encodeURIComponent(adapterOptions.temporaryKey)}`;
    }

    return url;
  },
});
