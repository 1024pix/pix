import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class AccountRecoveryDemandService extends Service {
  @service requestManager;

  async send({ firstName, lastName, ineIna, birthdate, email }) {
    return this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/account-recovery`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'account-recovery-demands',
          attributes: {
            'ine-ina': ineIna,
            'first-name': firstName,
            'last-name': lastName,
            birthdate,
            email,
          },
        },
      }),
    });
  }

  async update({ password, temporaryKey }) {
    return this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/account-recovery`,
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'account-recovery-demands',
          attributes: {
            password,
            'temporary-key': temporaryKey,
          },
        },
      }),
    });
  }
}
