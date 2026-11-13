import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Controller | authenticated/restricted-access', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  module('#certificationOpeningDate', function () {
    module('when isAccessBlockedCollege is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateCollege', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const intlService = this.owner.lookup('service:intl');
        intlService.t = (key, options) => {
          if (key === 'pages.sco.restricted-access.title-access') {
            return `Date: ${options.date}`;
          }
          return key;
        };

        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedCollege: true,
          pixCertifScoBlockedAccessDateCollege: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, 'Date: 12/12/2020');
      });
    });
    module('when isAccessBlockedLycee is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const intlService = this.owner.lookup('service:intl');
        intlService.t = (key, options) => {
          if (key === 'pages.sco.restricted-access.title-access') {
            return `Date: ${options.date}`;
          }
          return key;
        };

        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedLycee: true,
          pixCertifScoBlockedAccessDateLycee: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, 'Date: 12/12/2020');
      });
    });
    module('when isAccessBlockedAgri is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const intlService = this.owner.lookup('service:intl');
        intlService.t = (key, options) => {
          if (key === 'pages.sco.restricted-access.title-access') {
            return `Date: ${options.date}`;
          }
          return key;
        };

        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedAgri: true,
          pixCertifScoBlockedAccessDateLycee: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, 'Date: 12/12/2020');
      });
    });
    module('when isAccessBlockedAEFE is true', function () {
      test('should return a the pixCertifScoBlockedAccessDateLycee', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const intlService = this.owner.lookup('service:intl');
        intlService.t = (key, options) => {
          if (key === 'pages.sco.restricted-access.title-access') {
            return `Date: ${options.date}`;
          }
          return key;
        };

        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isAccessBlockedAEFE: true,
          pixCertifScoBlockedAccessDateLycee: '2020-12-12',
        });
        const controller = this.owner.lookup('controller:authenticated/restricted-access');
        controller.model = currentAllowedCertificationCenterAccess;

        // when then
        assert.strictEqual(controller.certificationOpeningDate, 'Date: 12/12/2020');
      });
    });
  });
});
