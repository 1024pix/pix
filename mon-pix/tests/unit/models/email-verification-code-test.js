import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Email-Verification-Code', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const emailVerificationCode = store.createRecord('email-verification-code');

    // when & then
    assert.ok(emailVerificationCode);
  });
});
