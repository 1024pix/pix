import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);

  module('#shouldDisplayResultRecipientInfoMessage', function() {

    module('when the current user certification center does manage students', function() {
      test('should also return false', function(assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/list');
        controller.currentUser = {
          currentCertificationCenter: { isScoManagingStudents: true },
        };

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.notOk(shouldDisplayResultRecipientInfoMessage);
      });
    });

    module('when current user is not sco managing students', function() {
      test('should return true', function(assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/list');
        controller.currentUser = {
          currentCertificationCenter: { isScoManagingStudents: false },
        };

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.ok(shouldDisplayResultRecipientInfoMessage);
      });
    });
  });
});
