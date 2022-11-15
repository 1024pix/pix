import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Model | certification', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasAcquiredComplementaryCertifications', function () {
    test('should be true when certification has certified badge image', function (assert) {
      const model = store.createRecord('certification', { certifiedBadgeImages: ['/some/img'] });
      assert.equal(model.hasAcquiredComplementaryCertifications, true);
    });

    test('should be false when certification has no certified badge image', function (assert) {
      const model = store.createRecord('certification', { certifiedBadgeImages: [] });
      assert.equal(model.hasAcquiredComplementaryCertifications, false);
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
        assert.equal(model.shouldDisplayProfessionalizingWarning, true);
      });

      test('should be false when when deliveredAt < 2022-01-01', function (assert) {
        // given
        const model = store.createRecord('certification', { deliveredAt: '2021-01-01' });

        // when / then
        assert.equal(model.shouldDisplayProfessionalizingWarning, false);
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
        assert.equal(model.shouldDisplayProfessionalizingWarning, false);
      });
    });
  });
});
