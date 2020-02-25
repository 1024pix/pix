import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/details', function(hooks) {
  setupTest(hooks);

  module('#computed certificationCandidatesCount()', function() {
    test('should return a string the the candidate count if more than 0 candidate', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: ['candidate1', 'candidate2'] };

      // when
      const actualStrCertificationCandidatesCount = controller.certificationCandidatesCount;

      // then
      assert.equal(actualStrCertificationCandidatesCount, `(${controller.model.certificationCandidates.length})`);
    });

    test('should return an empty string when there are no certification candidates in the session', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details');
      controller.model = { certificationCandidates: [] };

      // when
      const actualStrCertificationCandidatesCount = controller.certificationCandidatesCount;

      // then
      assert.equal(actualStrCertificationCandidatesCount, '');
    });
  });
});
