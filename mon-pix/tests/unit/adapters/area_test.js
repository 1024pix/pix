import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | Area', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function () {
    test('should build url for find all', function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:area');

      // when
      const url = adapter.urlForFindAll();

      // then
      assert.true(url.endsWith('api/frameworks/pix/areas-for-user'));
    });
  });
});
