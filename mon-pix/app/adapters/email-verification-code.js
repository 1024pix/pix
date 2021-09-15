import ApplicationAdapter from './application';

export default class EmailVerificationCodeAdapter extends ApplicationAdapter {

  createRecord(store, type, { adapterOptions }) {
    const { userId, password, newEmail } = adapterOptions;
    const url = `${this.host}/${this.namespace}/users/${userId}/email/verification-code`;
    const payload = {
      data: {
        data: {
          type: 'email-verification-code',
          attributes: {
            password,
            newEmail,
          },
        },
      },
    };

    return this.ajax(url, 'PUT', payload);
  }
}
