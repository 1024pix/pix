import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated', function(hooks) {
  setupTest(hooks);

  module('#get documentationLink', function() {
    test('should return a different link whether the center is SCO managing students or not', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated');

      // when
      controller.model = { isScoManagingStudents: true };
      const actualScoLink = controller.documentationLink;
      controller.model = { isScoManagingStudents: false };
      const actualOtherLink = controller.documentationLink;

      // then
      assert.notEqual(actualScoLink, actualOtherLink);
    });
  });
});
