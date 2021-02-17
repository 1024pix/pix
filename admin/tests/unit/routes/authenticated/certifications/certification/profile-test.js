import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/certifications/certification/profile', function(hooks) {
  setupTest(hooks);

  module('#model', function() {

    test('it should return hello', function(assert) {
      // given
      const route = this.owner.lookup('route:authenticated/certifications/certification/profile');

      // when
      const model = route.model();

      // then
      assert.equal(model, 'hello');
    });
  });
});
