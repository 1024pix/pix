import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | certification', function (hooks) {
  setupTest(hooks);

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
  });

  module('#shouldDisplayProfessionalizingWarning', function () {
    module('when domain is french', function (hooks) {
      hooks.beforeEach(function () {
        class CurrentDomainServiceStub extends Service {
          get isFranceDomain() {
            return true;
          }
        }
        this.owner.register('service:currentDomain', CurrentDomainServiceStub);
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
        class CurrentDomainServiceStub extends Service {
          get isFranceDomain() {
            return false;
          }
        }

        this.owner.register('service:currentDomain', CurrentDomainServiceStub);
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01' });

        // when / then
        assert.false(model.shouldDisplayProfessionalizingWarning);
      });
    });
  });
});
