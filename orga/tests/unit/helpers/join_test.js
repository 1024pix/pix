import { join } from 'pix-orga/helpers/join';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | join', function (hooks) {
  setupTest(hooks);

  module('join', () => {
    module('when there are several values', () => {
      test('it joins all values using the seperator', function (assert) {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(join([['Un', 'Deux'], ', ']), 'Un, Deux');
      });
    });
    module('when there is only one value', () => {
      test('it returns the value', function (assert) {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(join([['Un'], ', ']), 'Un');
      });
    });
  });
});
