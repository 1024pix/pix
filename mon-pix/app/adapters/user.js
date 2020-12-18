import ApplicationAdapter from './application';

export default class User extends ApplicationAdapter {

  shouldBackgroundReloadRecord() {
    return false;
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.updateExpiredPassword) {
      const url = this.buildURL('expired-password-update', null, snapshot, 'createRecord');

      delete adapterOptions.updateExpiredPassword;
      const newPassword = adapterOptions.newPassword;
      delete adapterOptions.newPassword;

      const { username, password: expiredPassword } = snapshot.record;
      const payload = {
        data: {
          attributes: { username, expiredPassword, newPassword },
        },
      };

      return this.ajax(url, 'POST', { data: payload });
    }

    if (adapterOptions && adapterOptions.campaignCode) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const { data } = this.serialize(snapshot);
      const payload = { data: { data, meta: { 'campaign-code': adapterOptions.campaignCode } } };
      return this.ajax(url, 'POST', payload);
    }

    return super.createRecord(...arguments);
  }

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    if (query.passwordResetTemporaryKey) {
      const temporaryKey = query.passwordResetTemporaryKey;
      delete query.passwordResetTemporaryKey;
      return `${this.host}/${this.namespace}/password-reset-demands/${temporaryKey}`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.acceptPixTermsOfService) {
      delete adapterOptions.acceptPixTermsOfService;
      return url + '/pix-terms-of-service-acceptance';
    }

    if (adapterOptions && adapterOptions.lang) {
      return url + '/lang/' + adapterOptions.lang;
    }

    if (adapterOptions && adapterOptions.rememberUserHasSeenAssessmentInstructions) {
      delete adapterOptions.rememberUserHasSeenAssessmentInstructions;
      return url + '/remember-user-has-seen-assessment-instructions';
    }

    if (adapterOptions && adapterOptions.rememberUserHasSeenNewLevelInfo) {
      delete adapterOptions.rememberUserHasSeenNewLevelInfo;
      return url + '/has-seen-new-level-info';
    }

    if (adapterOptions && adapterOptions.updatePassword) {
      delete adapterOptions.updatePassword;
      const temporaryKey = adapterOptions.temporaryKey;
      delete adapterOptions.temporaryKey;
      return url + `/password-update?temporary-key=${encodeURIComponent(temporaryKey)}`;
    }

    return url;
  }
}
