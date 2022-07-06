import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';
import sinon from 'sinon/pkg/sinon-esm';
import ENV from '../../../config/environment';

describe('Unit | Model | Reset-expired-password-demand', function () {
  setupTest();

  describe('#updateExpiredPassword', function () {
    it('should update password and return username', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('reset-expired-password-demand');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves({
        data: {
          attributes: {
            login: 'oui.oui0912',
          },
        },
      });

      const resetExpiredPasswordDemand = store.createRecord('reset-expired-password-demand', {
        passwordResetToken: 'PASSWORD_RESET_TOKEN',
        newPassword: 'pix123',
      });

      // when
      const result = await resetExpiredPasswordDemand.updateExpiredPassword();

      // then
      const url = `${ENV.APP.API_HOST}/api/expired-password-updates`;
      const payload = {
        data: {
          data: {
            attributes: {
              'password-reset-token': 'PASSWORD_RESET_TOKEN',
              'new-password': 'pix123',
            },
            type: 'reset-expired-password-demands',
          },
        },
      };
      sinon.assert.calledWith(adapter.ajax, url, 'POST', payload);
      expect(result).to.equal('oui.oui0912');
    });
  });
});
