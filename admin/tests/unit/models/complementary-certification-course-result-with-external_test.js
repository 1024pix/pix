import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | complementaryCertificationCourseResultWithExternal', function (hooks) {
  setupTest(hooks);

  module('#isExternalResultEditable', function () {
    module('when pixResult is "Rejetée"', function () {
      test('it returns false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const complementaryCertificationCourseResultWithExternal = store.createRecord(
          'complementary-certification-course-result-with-external',
          {
            pixResult: 'Rejetée',
          },
        );

        // when
        const isExternalResultEditable = complementaryCertificationCourseResultWithExternal.isExternalResultEditable;

        // then
        assert.false(isExternalResultEditable);
      });
    });
  });

  module('when pixResult is not "Rejetée"', function () {
    test('it returns true', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const complementaryCertificationCourseResultWithExternal = store.createRecord(
        'complementary-certification-course-result-with-external',
        {
          pixResult: 'Trop bien',
        },
      );

      // when
      const isExternalResultEditable = complementaryCertificationCourseResultWithExternal.isExternalResultEditable;

      // then
      assert.true(isExternalResultEditable);
    });
  });
});
