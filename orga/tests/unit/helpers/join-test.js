import { join } from 'pix-orga/helpers/join';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | join', (hooks) => {
  setupTest(hooks);

  module('join', () => {
    module('when there are several values', () => {
      test('it joins all values using the seperator', function(assert) {
        assert.equal(join([['Un', 'Deux'], ', ']), 'Un, Deux');
      });
    });
    module('when there is only one value', () => {
      test('it returns the value', function(assert) {
        assert.equal(join([['Un'], ', ']), 'Un');
      });
    });
  });
});
