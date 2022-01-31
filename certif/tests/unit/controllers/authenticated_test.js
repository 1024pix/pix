import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';

module('Unit | Controller | authenticated', function (hooks) {
  setupTest(hooks);

  module('#get documentationLink', function () {
    test('should return the dedicated link for non SCO isManagingStudents certification center', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          name: 'Sunnydale',
          type: 'NOT_SCO',
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');

      // when
      const documentationLink = controller.documentationLink;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(documentationLink, 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF');
    });

    test('should return the dedicated link for SCO isManagingStudents certification center', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          name: 'Sunnydale',
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');

      // when
      const documentationLink = controller.documentationLink;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(documentationLink, 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS');
    });
  });

  module('#get showBanner', function () {
    test('should return false when certif center is not SCO IsManagingStudents', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          name: 'Sunnydale',
          type: 'NOT_SCO',
          isAccessBlockedCollege: false,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      class RouterStub extends Service {
        currentRouteName = 'not.finalization-page';
      }
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');
      controller.isBannerVisible = false;

      // when
      const showBanner = controller.showBanner;

      // then
      assert.false(showBanner);
    });

    test('should return false when banner should not be visible', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          name: 'Sunnydale',
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
          isAccessBlockedCollege: false,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      class RouterStub extends Service {
        currentRouteName = 'not.finalization-page';
      }
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');
      controller.isBannerVisible = false;

      // when
      const showBanner = controller.showBanner;

      // then
      assert.false(showBanner);
    });

    test('should return false when user is currently on the finalization page', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          name: 'Sunnydale',
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
          isAccessBlockedCollege: false,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      class RouterStub extends Service {
        currentRouteName = 'authenticated.sessions.finalize';
      }
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');
      controller.isBannerVisible = true;

      // when
      const showBanner = controller.showBanner;

      // then
      assert.false(showBanner);
    });

    test('should return true when all above conditions are matched', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          name: 'Sunnydale',
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
          isAccessBlockedCollege: false,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      class RouterStub extends Service {
        currentRouteName = 'not.finalization-page';
      }
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');
      controller.isBannerVisible = true;

      // when
      const showBanner = controller.showBanner;

      // then
      assert.true(showBanner);
    });
  });

  module('#get showLinkToSessions', function () {
    test('should return false when certif center is blocked', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          isAccessBlockedCollege: true,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');

      // when
      const showLinkToSessions = controller.showLinkToSessions;

      // then
      assert.false(showLinkToSessions);
    });

    test('should return true when certif center is not blocked', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          isAccessBlockedCollege: false,
          isAccessBlockedLycee: false,
          isAccessBlockedAEFE: false,
          isAccessBlockedAgri: false,
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const controller = this.owner.lookup('controller:authenticated');

      // when
      const showLinkToSessions = controller.showLinkToSessions;

      // then
      assert.true(showLinkToSessions);
    });
  });

  module('#get isEndTestScreenRemovalEnabled', function () {
    test('should return true when current allowed certification center has end test screen removal enabled', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
        hasEndTestScreenRemovalEnabled: true,
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const controller = this.owner.lookup('controller:authenticated');

      // when
      const isEndTestScreenRemovalEnabled = controller.isEndTestScreenRemovalEnabled;

      // then
      assert.true(isEndTestScreenRemovalEnabled);
    });

    test('should return true when current allowed certification center has end test screen removal disabled', function (assert) {
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
        hasEndTestScreenRemovalEnabled: false,
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const controller = this.owner.lookup('controller:authenticated');

      // when
      const isEndTestScreenRemovalEnabled = controller.isEndTestScreenRemovalEnabled;

      // then
      assert.false(isEndTestScreenRemovalEnabled);
    });
  });
});
