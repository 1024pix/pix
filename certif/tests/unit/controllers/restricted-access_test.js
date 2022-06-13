import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/restricted-access', function (hooks) {
  setupTest(hooks);

  module('#pixCertifScoBlockedAccessDateCollege', function () {
    test('should return a the pixCertifScoBlockedAccessDateCollege', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        pixCertifScoBlockedAccessDateCollege: '12/12/2020',
      });
      const controller = this.owner.lookup('controller:authenticated/restricted-access');
      controller.model = currentAllowedCertificationCenterAccess;

      // when then
      assert.strictEqual(controller.model.pixCertifScoBlockedAccessDateCollege, '12/12/2020');
    });
  });

  module('#pixCertifScoBlockedAccessDateLycee', function () {
    test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        pixCertifScoBlockedAccessDateLycee: '12/12/2020',
      });
      const controller = this.owner.lookup('controller:authenticated/restricted-access');
      controller.model = currentAllowedCertificationCenterAccess;

      // when then
      assert.strictEqual(controller.model.pixCertifScoBlockedAccessDateLycee, '12/12/2020');
    });
  });
});
