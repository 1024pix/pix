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

    if (query.profile) {
      delete query.profile;
      return `${this._super(...arguments)}/me/profile`;
    }

    return this._super(...arguments);
  },
});
