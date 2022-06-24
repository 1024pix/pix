import ApplicationAdapter from './application';

export default class ResetExpiredPasswordDemand extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    const url = this.buildURL('expired-password-update', null, snapshot, 'createRecord');

    const { username, oneTimePassword, newPassword } = snapshot.record;
    const payload = {
      data: {
        attributes: { username, oneTimePassword, newPassword },
      },
    };

    return this.ajax(url, 'POST', { data: payload });
  }
}
