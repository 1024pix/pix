import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { ACQUIRED } from 'mon-pix/models/certification';
import Service from '@ember/service';

module('Unit | Model | certification', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasCleaCertif', function () {
    test('should have clea certif', function (assert) {
      const model = store.createRecord('certification');
      model.cleaCertificationStatus = ACQUIRED;
      assert.ok(model.hasCleaCertif);
    });

    test('should not have clea certif', function (assert) {
      const model = store.createRecord('certification');
      model.cleaCertificationStatus = 'AnythingElse';
      assert.notOk(model.hasCleaCertif);
    });
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
  });

  module('#shouldDisplayProfessionalizingWarning', function () {
    module('when domain is french', function (hooks) {
      hooks.beforeEach(function () {
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return true;
          }
        }

        this.owner.register('service:url', UrlServiceStub);
      });

      test('should be true when deliveredAt >= 2022-01-01 ', function (assert) {
        // given
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01' });

        // when / then
        assert.true(model.shouldDisplayProfessionalizingWarning);
      });

      test('should be false when when deliveredAt < 2022-01-01', function (assert) {
        // given
        const model = store.createRecord('certification', { deliveredAt: '2021-01-01' });

        // when / then
        assert.false(model.shouldDisplayProfessionalizingWarning);
      });
    });

    module('when domain is not french', function () {
      test('should be false', function (assert) {
        // given
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return false;
          }
        }

        this.owner.register('service:url', UrlServiceStub);
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01' });

        // when / then
        assert.false(model.shouldDisplayProfessionalizingWarning);
      });
    });
  });
});
