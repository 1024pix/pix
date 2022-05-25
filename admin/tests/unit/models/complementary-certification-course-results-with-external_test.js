import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | ComplementaryCertificationCourseResultsWithExternal', function (hooks) {
  setupTest(hooks);

  module('#isExternalResultEditable', function () {
    module('when pixResult is "Rejetée"', function () {
      test('it returns false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const complementaryCertificationCourseResultsWithExternal = store.createRecord(
          'complementary-certification-course-results-with-external',
          {
            pixResult: 'Rejetée',
          }
        );

        // when
        const isExternalResultEditable = complementaryCertificationCourseResultsWithExternal.isExternalResultEditable;

        // then
        assert.false(isExternalResultEditable);
      });
    });
  });

  module('when pixResult is not "Rejetée"', function () {
    test('it returns true', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const complementaryCertificationCourseResultsWithExternal = store.createRecord(
        'complementary-certification-course-results-with-external',
        {
          pixResult: 'Trop bien',
        }
      );

      // when
      const isExternalResultEditable = complementaryCertificationCourseResultsWithExternal.isExternalResultEditable;

      // then
      assert.true(isExternalResultEditable);
    });
  });
});
