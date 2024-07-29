import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | Authenticated | Team | new', (hooks) => {
  setupTest(hooks);

  module('#updateEmail', () => {
    test("removes email's spaces from input", function (assert) {
      // given
      const emailWithSpaces = '    user@example.net  ';
      const controller = this.owner.lookup('controller:authenticated/team/new');
      controller.model = {
        email: null,
      };

      // when
      controller.updateEmail({ target: { value: emailWithSpaces } });

      // then
      assert.strictEqual(controller.model.email, 'user@example.net');
    });
  });
});
