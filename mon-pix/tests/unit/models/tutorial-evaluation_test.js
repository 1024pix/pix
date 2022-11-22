import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | tutorial-evaluation model', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#nextStatus', function () {
    test('should return "NEUTRAL" when current status is "LIKED"', function (assert) {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'LIKED';

      // when & then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.nextStatus, 'NEUTRAL');
    });

    test('should return "LIKED" when current status is different from "LIKED"', function (assert) {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'NEUTRAL';

      // when & then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.nextStatus, 'LIKED');
    });
  });

  module('#isLiked', function () {
    test('should return true if status is "LIKED"', function (assert) {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'LIKED';

      // when & then
      assert.true(model.isLiked);
    });

    test('should return false if status is "NEUTRAL"', function (assert) {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'NEUTRAL';

      // when & then
      assert.false(model.isLiked);
    });
  });
});
