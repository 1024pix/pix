import { multiply } from 'pix-orga/helpers/multiply';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | multiply', function (hooks) {
  setupTest(hooks);

  module('multiply', () => {
    test('it multiply 10 by 2', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(multiply([10, 2]), 20);
    });

    test('it multiply 10 by 2 by 20', function (assert) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(multiply([10, 2, 20]), 400);
    });
  });
});
