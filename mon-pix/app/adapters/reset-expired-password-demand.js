import ApplicationAdapter from './application';

export default class ResetExpiredPasswordDemand extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    const url = this.buildURL('expired-password-update', null, snapshot, 'createRecord');

    const { passwordResetToken, newPassword } = snapshot.record;
    const payload = {
      data: {
        attributes: { passwordResetToken, newPassword },
      },
    };

    return this.ajax(url, 'POST', { data: payload });
  }
}
