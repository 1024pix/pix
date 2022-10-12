import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Controller | authenticated/team', function (hooks) {
  setupTest(hooks);

  module('#shouldDisplayNoRefererSection', function () {
    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is enabled', function (hooks) {
      hooks.beforeEach(function () {
        class FeatureTogglesStub extends Service {
          featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
      });

      module('when certification center has CLEA habilitation', function () {
        module('when there is a referer', function () {
          test('should return false', function (assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/team');
            const store = this.owner.lookup('service:store');
            const referer = store.createRecord('member', {
              isReferer: true,
            });
            const notReferer = store.createRecord('member', {
              isReferer: false,
            });
            controller.model = { members: [referer, notReferer], hasCleaHabilitation: true };

            // when then
            assert.false(controller.shouldDisplayNoRefererSection);
          });
        });

        module('when there is no referer', function () {
          test('should return true', function (assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/team');
            const store = this.owner.lookup('service:store');

            const notReferer = store.createRecord('member', {
              isReferer: false,
            });
            controller.model = { members: [notReferer], hasCleaHabilitation: true };

            // when then
            assert.true(controller.shouldDisplayNoRefererSection);
          });
        });
      });
    });

    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is not enabled', function (hooks) {
      hooks.beforeEach(function () {
        class FeatureTogglesStub extends Service {
          featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: false };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
      });
      module('when there is a referer', function () {
        test('should return false', function (assert) {
          // given
          const controller = this.owner.lookup('controller:authenticated/team');
          const store = this.owner.lookup('service:store');
          const referer = store.createRecord('member', {
            isReferer: true,
          });
          const notReferer = store.createRecord('member', {
            isReferer: false,
          });
          controller.model = { members: [referer, notReferer], hasCleaHabilitation: true };

          // when then
          assert.false(controller.shouldDisplayNoRefererSection);
        });
      });

      module('when there is no referer', function () {
        test('should return false', function (assert) {
          // given
          const controller = this.owner.lookup('controller:authenticated/team');
          const store = this.owner.lookup('service:store');

          const notReferer = store.createRecord('member', {
            isReferer: false,
          });
          controller.model = { members: [notReferer], hasCleaHabilitation: true };

          // when then
          assert.false(controller.shouldDisplayNoRefererSection);
        });
      });
    });
  });

  module('#toggleRefererModal', function () {
    module('when shouldShowRefererSelectionModal is true', function () {
      test('should set the value to false', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/team');

        controller.shouldShowRefererSelectionModal = true;

        // when
        controller.toggleRefererModal();

        // then
        assert.false(controller.shouldShowRefererSelectionModal);
      });
    });

    module('when shouldShowRefererSelectionModal is false', function () {
      test('should set the value to true', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/team');

        controller.shouldShowRefererSelectionModal = false;

        // when
        controller.toggleRefererModal();

        // then
        assert.true(controller.shouldShowRefererSelectionModal);
      });
    });
  });
});
