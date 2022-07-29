import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Adapter | Email-Verification-Code', function (hooks) {
  setupTest(hooks);

  module('#buildURL', () => {
    test('should call API to send email verification code', async function (assert) {
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
      assert.true(url.endsWith('users/123'));
    });
  });
});
