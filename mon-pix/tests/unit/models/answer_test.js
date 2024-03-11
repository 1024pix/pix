import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | Answer', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('competence-result');

    assert.ok(model);
  });

  module('isResultOk', function () {
    test('should return true when answser.result is ok', function (assert) {
      // given
      const answer = store.createRecord('answer', { result: 'ok' });

      // when
      const result = answer.isResultOk;

      assert.true(result);
    });

    test('should return false when answser.result is ko', function (assert) {
      // given
      const answer = store.createRecord('answer', { result: 'ko' });

      // when
      const result = answer.isResultOk;

      assert.false(result);
    });
  });
  module('isResultNotOk', function () {
    test('should return true when answser.result is ok', function (assert) {
      // given
      const answer = store.createRecord('answer', { result: 'ok' });

      // when
      const result = answer.isResultNotOk;

      assert.false(result);
    });

    test('should return false when answser.result is ko', function (assert) {
      // given
      const answer = store.createRecord('answer', { result: 'ko' });

      // when
      const result = answer.isResultNotOk;

      assert.true(result);
    });
  });
});
