import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Components | certification-session-report', function(hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.lookup('component:certification-session-report');
  });

  module('#duplicates', function() {
    test('should return an empty array when there is no duplicates in candidate list', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: 123 },
        { row: 2, certificationId: 456 },
        { row: 3, certificationId: 789 },
      ];
      component.set('candidates', candidates);

      // when
      const duplicates = component.duplicates;

      // then
      const expectedResult = [];
      assert.deepEqual(duplicates, expectedResult);
    });

    test('should return an array with certifications IDs when there is one duplicate in candidate list', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: 123 },
        { row: 2, certificationId: 123 },
        { row: 3, certificationId: 789 },
      ];
      component.set('candidates', candidates);

      // when
      const duplicates = component.duplicates;

      // then
      const expectedResult = [123];
      assert.deepEqual(duplicates, expectedResult);
    });

    test('should return an array with certifications IDs when there are duplicates in candidate list', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: 123 },
        { row: 2, certificationId: 123 },
        { row: 1, certificationId: 456 },
        { row: 2, certificationId: 456 },
        { row: 3, certificationId: 789 },
      ];
      component.set('candidates', candidates);

      // when
      const duplicates = component.duplicates;

      // then
      const expectedResult = [123, 456];
      assert.deepEqual(duplicates, expectedResult);
    });
  });

  module('#withoutCandidate', function() {
    test('should return an empty array when every candidates certification IDs match an existing certification', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: 123 },
        { row: 2, certificationId: 456 },
        { row: 3, certificationId: 789 },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: 123 },
        { id: 456 },
        { id: 789 },
      ];
      component.set('certifications', certifications);

      // when
      const certificationsWithoutCandidate = component.withoutCandidate;

      // then
      const expectedResult = [];
      assert.deepEqual(certificationsWithoutCandidate, expectedResult);
    });

    test('should return an array with certifications missing associated candidate', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: 123 },
        { row: 2, certificationId: 456 },
        { row: 3, certificationId: 789 },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: 123 },
        { id: 100000 },
        { id: 200000 },
      ];
      component.set('certifications', certifications);

      // when
      const certificationsWithoutCandidate = component.withoutCandidate;

      // then
      const expectedResult = [
        { id: 100000 },
        { id: 200000 }
      ];
      assert.deepEqual(certificationsWithoutCandidate, expectedResult);
    });
  });

});
