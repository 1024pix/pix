import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated', (hooks) => {
  setupTest(hooks);

  module('#get documentationLink', () => {
    test('should return a different link whether the center is SCO managing students or not', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated');

      // when
      controller.currentUser = {
        currentCertificationCenter: { isScoManagingStudents: true },
      };
      const actualScoLink = controller.documentationLink;
      controller.currentUser.currentCertificationCenter.isScoManagingStudents = false;
      const actualOtherLink = controller.documentationLink;

      // then
      assert.notEqual(actualScoLink, actualOtherLink);
    });
  });
});
