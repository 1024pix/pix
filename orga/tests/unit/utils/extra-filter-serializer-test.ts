import { setupTest } from 'ember-qunit';
import extraFilterSerializer from 'pix-orga/utils/extra-filter-serializer';
import { module, test } from 'qunit';

module('Unit | Utils | extra-filter-serializer', function (hooks) {
  setupTest(hooks);
  module('encodeExtraFilters', () => {
    test('it should encode data', function (assert) {
      assert.strictEqual(
        extraFilterSerializer.encodeExtraFilters({ jeanne: 'serge' }),
        '%7B%22jeanne%22:%22serge%22%7D',
      );
    });
  });
  module('decodeExtraFilters', () => {
    test('it should decode data', function (assert) {
      assert.deepEqual(extraFilterSerializer.decodeExtraFilters('%7B%22jeanne%22:%22serge%22%7D'), { jeanne: 'serge' });
    });
  });
});
