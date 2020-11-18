import { join } from 'pix-orga/helpers/join';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | join', function(hooks) {
  setupTest(hooks);

  module('join', () => {
    test('it joins all values using the seperator', function(assert) {
      assert.equal(join([['Un',  'Deux'], ', ']), 'Un, Deux');
    });
  });
});
