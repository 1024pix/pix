import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

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
      const answer = run(() => store.createRecord('answer', { result: 'ok' }));

      // when
      const result = answer.isResultOk;

      assert.equal(result, true);
    });

    test('should return false when answser.result is ko', function (assert) {
      // given
      const answer = run(() => store.createRecord('answer', { result: 'ko' }));

      // when
      const result = answer.isResultOk;

      assert.equal(result, false);
    });
  });
  module('isResultNotOk', function () {
    test('should return true when answser.result is ok', function (assert) {
      // given
      const answer = run(() => store.createRecord('answer', { result: 'ok' }));

      // when
      const result = answer.isResultNotOk;

      assert.equal(result, false);
    });

    test('should return false when answser.result is ko', function (assert) {
      // given
      const answer = run(() => store.createRecord('answer', { result: 'ko' }));

      // when
      const result = answer.isResultNotOk;

      assert.equal(result, true);
    });
  });
});
