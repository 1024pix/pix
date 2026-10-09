import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | is-certifiable', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#isCleaEligible', function () {
    test('should be truthy when validatedDoubleCertification is true', function (assert) {
      // given
      const model = store.createRecord('is-certifiable', {
        doubleCertificationEligibility: { validatedDoubleCertification: true },
      });

      // when
      const result = model.isCleaEligible;

      // then
      assert.ok(result);
    });

    test('should be falsy when validatedDoubleCertification is false', function (assert) {
      // given
      const model = store.createRecord('is-certifiable', {
        doubleCertificationEligibility: { validatedDoubleCertification: false },
      });

      // when
      const result = model.isCleaEligible;

      // then
      assert.notOk(result);
    });

    test('should be falsy when doubleCertificationEligibility does not exist', function (assert) {
      // given
      const model = store.createRecord('is-certifiable');

      // when
      const result = model.isCleaEligible;

      // then
      assert.notOk(result);
    });
  });
});
