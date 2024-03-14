import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | authenticated/restricted-access', function (hooks) {
  setupTest(hooks);

  module('#certificationOpeningDate', function () {
    module('when isAccessBlockedCollege is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateCollege', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedCollege: true,
          pixCertifScoBlockedAccessDateCollege: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, '2020-12-12');
      });
    });

    module('when isAccessBlockedLycee is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedLycee: true,
          pixCertifScoBlockedAccessDateLycee: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, '2020-12-12');
      });
    });

    module('when isAccessBlockedAgri is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedAgri: true,
          pixCertifScoBlockedAccessDateLycee: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, '2020-12-12');
      });
    });
    module('when isAccessBlockedAEFE is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedAEFE: true,
          pixCertifScoBlockedAccessDateLycee: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, '2020-12-12');
      });
    });
  });
});
