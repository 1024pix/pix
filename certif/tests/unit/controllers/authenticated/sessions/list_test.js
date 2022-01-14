import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';

module('Unit | Controller | authenticated/sessions/list', function (hooks) {
  setupTest(hooks);

  module('#shouldDisplayResultRecipientInfoMessage', function () {
    module('when the current user certification center does manage students', function () {
      test('should also return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = run(() =>
          store.createRecord('allowed-certification-center-access', {
            id: 123,
            type: 'SCO',
            isRelatedToManagingStudentsOrganization: true,
          })
        );
        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const controller = this.owner.lookup('controller:authenticated/sessions/list');

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.notOk(shouldDisplayResultRecipientInfoMessage);
      });
    });

    module('when current user is not sco managing students', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = run(() =>
          store.createRecord('allowed-certification-center-access', {
            id: 123,
            type: 'SCO',
            isRelatedToManagingStudentsOrganization: false,
          })
        );
        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const controller = this.owner.lookup('controller:authenticated/sessions/list');

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.ok(shouldDisplayResultRecipientInfoMessage);
      });
    });
  });
});
