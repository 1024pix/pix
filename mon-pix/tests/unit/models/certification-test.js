import { setupTest } from 'ember-qunit';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Model | certification', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasAcquiredComplementaryCertifications', function () {
    test('should be true when certification has certified badge image', function (assert) {
      const model = store.createRecord('certification', { certifiedBadgeImages: ['/some/img'] });
      assert.true(model.hasAcquiredComplementaryCertifications);
    });

    test('should be false when certification has no certified badge image', function (assert) {
      const model = store.createRecord('certification', { certifiedBadgeImages: [] });
      assert.false(model.hasAcquiredComplementaryCertifications);
    });

    test('should be false when certifiedBadgeImages is undefined', function (assert) {
      const model = store.createRecord('certification', {});
      assert.false(model.hasAcquiredComplementaryCertifications);
    });
  });

  module('#title', function () {
    test('should return CORE framework title when certificationFramework is not set', function (assert) {
      // given
      const model = store.createRecord('certification', {});
      const intl = this.owner.lookup('service:intl');

      // when / then
      assert.strictEqual(model.title, intl.t('pages.certificate.framework-title.CORE'));
    });

    test('should return the framework-specific title when certificationFramework is set', function (assert) {
      // given
      const model = store.createRecord('certification', { certificationFramework: 'EDU_1ER_DEGRE' });
      const intl = this.owner.lookup('service:intl');

      // when / then
      assert.strictEqual(model.title, intl.t('pages.certificate.framework-title.EDU_1ER_DEGRE'));
    });
  });

  module('#hasPixPlusFramework', function () {
    test('should be false when framework is CORE', function (assert) {
      const model = store.createRecord('certification', { certificationFramework: 'CORE' });
      assert.false(model.hasPixPlusFramework);
    });

    test('should be false when framework is CLEA', function (assert) {
      const model = store.createRecord('certification', { certificationFramework: 'CLEA' });
      assert.false(model.hasPixPlusFramework);
    });

    test('should be true when framework is an EDU framework', function (assert) {
      const model = store.createRecord('certification', { certificationFramework: 'EDU_1ER_DEGRE' });
      assert.true(model.hasPixPlusFramework);
    });

    test('should be true when framework is DROIT', function (assert) {
      const model = store.createRecord('certification', { certificationFramework: 'DROIT' });
      assert.true(model.hasPixPlusFramework);
    });
  });

  module('#shouldDisplayProfessionalizingWarning', function () {
    module('when domain is french', function (hooks) {
      hooks.beforeEach(function () {
        const domainService = this.owner.lookup('service:currentDomain');
        sinon.stub(domainService, 'getExtension').returns('fr');
      });

      module('when version is 2', function () {
        const version = 2;

        test('should be true when deliveredAt >= 2022-01-01 ', function (assert) {
          // given
          const model = store.createRecord('certification', { version, deliveredAt: '2022-01-01' });

          // when / then
          assert.true(model.shouldDisplayProfessionalizingWarning);
        });

        test('should be false when when deliveredAt < 2022-01-01', function (assert) {
          // given
          const model = store.createRecord('certification', { version, deliveredAt: '2021-01-01' });

          // when / then
          assert.false(model.shouldDisplayProfessionalizingWarning);
        });
      });
    });

    module('when domain is not french', function () {
      test('should be false', function (assert) {
        // given
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01' });

        // when / then
        assert.false(model.shouldDisplayProfessionalizingWarning);
      });
    });

    module('when version is not 2', function () {
      test('should be false', function (assert) {
        // given
        const domainService = this.owner.lookup('service:currentDomain');
        sinon.stub(domainService, 'getExtension').returns('fr');
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01', version: 3 });

        // when / then
        assert.false(model.shouldDisplayProfessionalizingWarning);
      });
    });
  });
});
