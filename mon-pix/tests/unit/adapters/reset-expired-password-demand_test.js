import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | reset-expired-password-demand', function() {

  setupTest();

  describe('#createRecord', function() {

    it('should call expired-password-updates ', async function() {
      // given
      const username = 'username123';
      const expiredPassword = 'Password123';
      const newPassword = 'Password456';
      const resetExpiredPasswordDemand = { username, newPassword, oneTimePassword: expiredPassword };
      const expectedUrl = 'http://localhost:3000/api/expired-password-updates';
      const expectedMethod = 'POST';
      const expectedData = {
        data: {
          data: {
            attributes: { username, expiredPassword, newPassword },
          },
        },
      };
      const adapter = this.owner.lookup('adapter:reset-expired-password-demand');
      adapter.ajax = sinon.stub().resolves();

      // when
      const snapshot = { record: resetExpiredPasswordDemand };
      await adapter.createRecord(null, null, snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
    });
  });
});
