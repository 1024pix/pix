import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/certifications/certification/details', function (hooks) {
  setupTest(hooks);

  module('#shouldDisplayJuryScore', function () {
    test('it returns true if the jury score is 0', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.set('juryScore', 0);

      // when
      const shouldDisplayJuryScore = controller.shouldDisplayJuryScore;

      // then
      assert.true(shouldDisplayJuryScore);
    });

    test('it returns true if the jury score is a number', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.set('juryScore', 3);

      // when
      const shouldDisplayJuryScore = controller.shouldDisplayJuryScore;

      // then
      assert.true(shouldDisplayJuryScore);
    });

    test('it returns false if the jury score is not a number', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.set('juryScore', null);

      // when
      const shouldDisplayJuryScore = controller.shouldDisplayJuryScore;

      // then
      assert.false(shouldDisplayJuryScore);
    });
  });
});
