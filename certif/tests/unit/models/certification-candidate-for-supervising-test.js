import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | certification-candidate-for-supervising', function (hooks) {
  setupTest(hooks);

  module('#get hasStarted', () => {
    test('returns false if assessmentStatus is not started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: null };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.hasStarted);
    });

    test('returns true if assessmentStatus is started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'started' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.hasStarted);
    });
  });

  module('#get hasCompleted', () => {
    test('returns false if assessmentStatus is started', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'started' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.false(model.hasCompleted);
    });

    test('returns true if assessmentStatus is completed', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'completed' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.hasCompleted);
    });

    test('returns true if assessmentStatus is endedByInvigilator', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const data = { assessmentStatus: 'endedByInvigilator' };

      // when
      const model = store.createRecord('certification-candidate-for-supervising', data);

      // then
      assert.true(model.hasCompleted);
    });
  });

  module('#hasOngoingChallengeLiveAlert', function () {
    module('when the current live alert type is challenge', function () {
      module('when the live alert status is ongoing', function () {
        test('it returns true', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const challengeLiveAlert = { type: 'challenge', status: 'ongoing' };

          // when
          const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
            challengeLiveAlert,
          });

          // then
          assert.true(certificationCandidateForInvigilating.hasOngoingChallengeLiveAlert);
        });
      });

      module('when the live alert status is not ongoing', function () {
        test('it returns false', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const challengeLiveAlert = { status: 'validated' };

          // when
          const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
            challengeLiveAlert,
          });

          // then
          assert.false(certificationCandidateForInvigilating.hasOngoingChallengeLiveAlert);
        });
      });

      module('when the current live alert type is not challenge', function () {
        test('it returns false', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const challengeLiveAlert = { status: 'ongoing' };
          const companionLiveAlert = { status: 'ONGOING' };

          // when
          const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
            challengeLiveAlert,
            companionLiveAlert,
          });

          // then
          assert.false(certificationCandidateForInvigilating.hasOngoingChallengeLiveAlert);
        });
      });
    });
  });

  module('#currentLiveAlert', function () {
    module('when challenge and companion live alerts both exists', function () {
      test('it returns companion live alert', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const challengeLiveAlert = { type: 'challenge', status: 'ongoing' };
        const companionLiveAlert = { type: 'companion', status: 'ONGOING' };

        // when
        const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
          challengeLiveAlert,
          companionLiveAlert,
        });

        // then
        assert.deepEqual(certificationCandidateForInvigilating.currentLiveAlert, companionLiveAlert);
      });
    });
  });

  module('#hasOngoingCompanionLiveAlert', function () {
    module('when the current live alert type is companion', function () {
      module('when the status is ongoing', function () {
        test('it returns true', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const companionLiveAlert = { type: 'companion', status: 'ONGOING' };

          // when
          const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
            companionLiveAlert,
          });

          // then
          assert.true(certificationCandidateForInvigilating.hasOngoingCompanionLiveAlert);
        });
      });

      module('when the status is not ongoing', function () {
        test('it returns false', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const companionLiveAlert = { type: 'companion', status: 'CLEARED' };

          // when
          const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
            companionLiveAlert,
          });

          // then
          assert.false(certificationCandidateForInvigilating.hasOngoingCompanionLiveAlert);
        });
      });
    });

    module('when the current live alert type is not companion', function () {
      test('it returns false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const challengeLiveAlert = { type: 'challenge', status: 'ongoing' };
        const companionLiveAlert = null;

        // when
        const certificationCandidateForInvigilating = store.createRecord('certification-candidate-for-supervising', {
          challengeLiveAlert,
          companionLiveAlert,
        });

        // then
        assert.false(certificationCandidateForInvigilating.hasOngoingCompanionLiveAlert);
      });
    });
  });
});
