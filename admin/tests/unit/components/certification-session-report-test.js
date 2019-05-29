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

});
