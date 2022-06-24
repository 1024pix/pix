import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | reset-expired-password-demand', function () {
  setupTest();

  describe('#createRecord', function () {
    it('should call expired-password-updates ', async function () {
      // given
      const resetExpiredPasswordDemand = { passwordResetToken: 'passwordResetToken', oneTimePassword: 'Password123' };
      const adapter = this.owner.lookup('adapter:reset-expired-password-demand');
      adapter.ajax = sinon.stub().resolves();

      // when
      const snapshot = { record: resetExpiredPasswordDemand };
      await adapter.createRecord(null, null, snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/expired-password-updates', 'POST', {
        data: {
          data: {
            attributes: { passwordResetToken: 'passwordResetToken', oneTimePassword: 'Password123' },
          },
        },
      });
    });
  });
});
