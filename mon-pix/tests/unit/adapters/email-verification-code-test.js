import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';

describe('Unit | Adapter | Email-Verification-Code', function () {
  setupTest();

  describe('#buildURL', () => {
    it('should call API to send email verification code', async function () {
      // given
      const adapter = this.owner.lookup('adapter:email-verification-code');
      const getStub = sinon.stub();
      class CurrentUserStub extends Service {
        user = { get: getStub.returns(123) };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const url = await adapter.buildURL();

      // then
      expect(url.endsWith('users/123')).to.be.true;
    });
  });
});
