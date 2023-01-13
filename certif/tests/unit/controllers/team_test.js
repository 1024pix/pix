import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

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

        module('when there is no member', function () {
          test('should return false', function (assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/team');
            controller.model = { members: [], hasCleaHabilitation: true };

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

  module('#membersSelectOptionsSortedByLastName', function () {
    test('should return an array of non referer members select options ordered by last name', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/team');
      const store = this.owner.lookup('service:store');
      const member1 = store.createRecord('member', {
        id: 102,
        firstName: 'Abe',
        lastName: 'Sapiens',
        isReferer: false,
      });
      const member2 = store.createRecord('member', {
        id: 100,
        firstName: 'Trevor',
        lastName: 'Bruttenholm',
        isReferer: false,
      });
      const member3 = store.createRecord('member', {
        id: 101,
        firstName: 'Aby',
        lastName: 'Gails',
        isReferer: true,
      });
      controller.model = { members: [member1, member2, member3], hasCleaHabilitation: true };

      // when then
      assert.deepEqual(controller.membersSelectOptionsSortedByLastName, [
        {
          label: 'Trevor Bruttenholm',
          value: '100',
        },
        {
          label: 'Abe Sapiens',
          value: '102',
        },
      ]);
    });
  });

  module('#onSelectReferer', function () {
    test('should select the id of a selected member', function (assert) {
      // given
      const optionSelected = 102;
      const controller = this.owner.lookup('controller:authenticated/team');

      // when
      controller.onSelectReferer(optionSelected);

      // then
      assert.strictEqual(controller.selectedReferer, 102);
    });
  });

  module('#onValidateReferer', function () {
    module('when a referer is selected', function () {
      test('should call updateReferer model method', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/team');
        const store = this.owner.lookup('service:store');
        const updateRefererStub = sinon.stub();
        const sendStub = sinon.stub();
        const member = store.createRecord('member', {
          id: 102,
          firstName: 'Abe',
          lastName: 'Sapiens',
          updateReferer: updateRefererStub,
        });
        controller.selectedReferer = '102';
        controller.model = { members: [member], hasCleaHabilitation: true };
        controller.send = sendStub;

        // when
        controller.onValidateReferer();

        // then
        sinon.assert.calledWith(updateRefererStub, { userId: '102', isReferer: true });
        assert.true(true);
      });
    });

    module('when there is no referer selected', function () {
      test('should not call updateReferer model method', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/team');
        const store = this.owner.lookup('service:store');
        const updateRefererStub = sinon.stub();
        const sendStub = sinon.stub();
        const member = store.createRecord('member', {
          id: 102,
          firstName: 'Abe',
          lastName: 'Sapiens',
          updateReferer: updateRefererStub,
        });
        controller.selectedReferer = '';
        controller.model = { members: [member], hasCleaHabilitation: true };
        controller.send = sendStub;

        // when
        controller.onValidateReferer();

        // then
        sinon.assert.notCalled(updateRefererStub);
        assert.true(true);
      });
    });
  });

  module('#shouldDisplayUpdateRefererButton', function () {
    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is enabled', function (hooks) {
      hooks.beforeEach(function () {
        class FeatureTogglesStub extends Service {
          featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
      });

      module('when there is only one member', function () {
        test('should return false', function (assert) {
          // given
          const controller = this.owner.lookup('controller:authenticated/team');
          const store = this.owner.lookup('service:store');
          const isReferer = store.createRecord('member', {
            isReferer: true,
          });

          controller.model = { members: [isReferer], hasCleaHabilitation: true };

          // when then
          assert.false(controller.shouldDisplayUpdateRefererButton);
        });
      });
      module('when there is at least 2 members', function () {
        module('when there is a referer', function () {
          test('should return true', function (assert) {
            // given
            const controller = this.owner.lookup('controller:authenticated/team');
            const store = this.owner.lookup('service:store');

            const notReferer = store.createRecord('member', {
              isReferer: false,
            });
            const isReferer = store.createRecord('member', {
              isReferer: true,
            });

            controller.model = { members: [notReferer, isReferer], hasCleaHabilitation: true };

            // when then
            assert.true(controller.shouldDisplayUpdateRefererButton);
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
            const notReferer2 = store.createRecord('member', {
              isReferer: false,
            });

            controller.model = { members: [notReferer, notReferer2], hasCleaHabilitation: true };

            // when then
            assert.false(controller.shouldDisplayUpdateRefererButton);
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

      test('should return false', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/team');
        const store = this.owner.lookup('service:store');

        const member = store.createRecord('member');
        controller.model = { members: [member], hasCleaHabilitation: true };

        // when then
        assert.false(controller.shouldDisplayUpdateRefererButton);
      });
    });
  });
});
