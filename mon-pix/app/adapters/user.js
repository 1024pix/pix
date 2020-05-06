import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class User extends ApplicationAdapter {
  shouldBackgroundReloadRecord() {
    return false;
  }

  urlForCreateRecord(query, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);
    if (adapterOptions && adapterOptions.isStudentDependentUser) {
      return `${this.host}/${this.namespace}/student-dependent-users`;
    }

    return url;
  }

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

    if (adapterOptions && adapterOptions.updateExpiredPassword) {
      const url = this.buildURL('expired-password-update', null, snapshot, 'createRecord');

      delete adapterOptions.updateExpiredPassword;
      const newPassword = adapterOptions.newPassword;
      delete adapterOptions.newPassword;

      const { username, password: expiredPassword } = snapshot.record;
      const payload = {
        data: {
          attributes: { username, expiredPassword, newPassword }
        }
      };

      return this.ajax(url, 'POST', { data: payload });
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
  }
}
