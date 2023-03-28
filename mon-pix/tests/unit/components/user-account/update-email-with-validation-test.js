import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | user-account | update-email-with-validation', function (hooks) {
  setupTest(hooks);

  module('#showVerificationCode', function () {
    test('should show verification code page', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/update-email-with-validation');
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      assert.false(component.showEmailForm);
    });

    test('should save new email trimmed and in lowercase on sendVerificationCode', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/update-email-with-validation');
      const newEmail = '   Toto@Example.net    ';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      assert.strictEqual(component.newEmail, 'Toto@Example.net');
    });

    test('should save password on sendVerificationCode', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/update-email-with-validation');
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      assert.strictEqual(component.password, 'pix123');
    });
  });
});
