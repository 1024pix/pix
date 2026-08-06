import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | update-expired-password', function (hooks) {
  setupTest(hooks);

  test('should retrieve a reset expired password demand', async function (assert) {
    // given
    const route = this.owner.lookup('route:update-expired-password');
    const params = { passwordResetToken: 'token' };

    // when
    const model = await route.model(params);

    // then
    assert.deepEqual(model, { passwordResetToken: params.passwordResetToken });
  });
});
