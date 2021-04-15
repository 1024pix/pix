import ApplicationAdapter from './application';

export default class ResetExpiredPasswordDemand extends ApplicationAdapter {

  createRecord(store, type, snapshot) {

    const url = this.buildURL('expired-password-update', null, snapshot, 'createRecord');

    const { username, oneTimePassword: expiredPassword, newPassword } = snapshot.record;
    const payload = {
      data: {
        attributes: { username, expiredPassword, newPassword },
      },
    };

    return this.ajax(url, 'POST', { data: payload });

  }
}
