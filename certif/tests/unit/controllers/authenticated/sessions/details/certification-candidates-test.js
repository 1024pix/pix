import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/details/certification-candidates', (hooks) => {
  setupTest(hooks);

  module('#computed hasOneOrMoreCandidates()', () => {
    test('It should return true when has one or more candidates', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      controller.model = { certificationCandidates: ['certifCandidate1', 'certifCanddate2'] } ;

      const shouldDisplayStudentList = controller.hasOneOrMoreCandidates;

      // then
      assert.equal(shouldDisplayStudentList, true);
    });

    test('It should return false when has no candidate', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');

      // when
      controller.model = { certificationCandidates: [] } ;

      const shouldDisplayStudentList = controller.hasOneOrMoreCandidates;

      // then
      assert.equal(shouldDisplayStudentList, false);
    });
  });
});
