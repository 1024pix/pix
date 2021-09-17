import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | Email-Verification-Code', function() {
  setupTest();

  describe('#createRecord', () => {
    it('should call API to send email verification code', async function() {
      // given
      const adapter = this.owner.lookup('adapter:email-verification-code');
      adapter.ajax = sinon.stub().resolves();

      const userId = '123';
      const newEmail = 'hello@example.net';
      const password = 'pix123';
      const snapshot = {
        adapterOptions: {
          userId,
          password,
          newEmail,
        },
      };

      const expectedUrl = `http://localhost:3000/api/users/${userId}/email/verification-code`;
      const expectedMethod = 'PUT';
      const expectedPayload = {
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

      // when
      await adapter.createRecord(null, 'email-verification-code', snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedPayload);
    });
  });
});
