import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | v3-certification-course-details-for-administration', function (hooks) {
  setupTest(hooks);

  module('#numberOfOkAnswers', function () {
    test('it should return the number of OK answers', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationChallengeDetails = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          ['ok', 'ok', 'ko', 'aband', null],
          store,
        ),
      });

      // when
      const result = certificationChallengeDetails.numberOfOkAnswers;

      // then
      assert.strictEqual(result, 2);
    });
  });

  module('#numberOfKoAnswers', function () {
    test('it should return the number of KO answers', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationChallengeDetails = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          ['ko', 'ok', 'ko', 'aband', null],
          store,
        ),
      });

      // when
      const result = certificationChallengeDetails.numberOfKoAnswers;

      // then
      assert.strictEqual(result, 2);
    });
  });

  module('#numberOfAbandAnswers', function () {
    test('it should return the number of abandonned answers', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationChallengeDetails = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          ['aband', 'ok', 'ko', 'aband', null],
          store,
        ),
      });

      // when
      const result = certificationChallengeDetails.numberOfAbandAnswers;

      // then
      assert.strictEqual(result, 2);
    });
  });

  module('#numberOfValidatedLiveAlerts', function () {
    test('it should return the number of challenges with validated live alerts', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationChallengeDetails = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          [null, 'ok', null, 'ok', null],
          store,
        ),
      });

      // when
      const result = certificationChallengeDetails.numberOfValidatedLiveAlerts;

      // then
      assert.strictEqual(result, 3);
    });
  });

  module('#duration', function () {
    [
      {
        assessmentState: 'completed',
        completedAt: new Date('2023-01-13T08:05:00Z'),
        endedAt: null,
      },
      {
        assessmentState: 'endedBySupervisor',
        endedAt: new Date('2023-01-13T08:05:00Z'),
        completedAt: null,
      },
      {
        assessmentState: 'endedDueToFinalization',
        endedAt: new Date('2023-01-13T08:05:00Z'),
        completedAt: null,
      },
    ].forEach(({ assessmentState, endedAt, completedAt }) => {
      module(`when session is ${assessmentState}`, function () {
        test('it should return the duration based on completion time', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const certificationChallengeDetails = store.createRecord(
            'v3-certification-course-details-for-administration',
            {
              assessmentState,
              createdAt: new Date('2023-01-13T08:00:00Z'),
              completedAt,
              endedAt,
            },
          );

          // when
          const resultInMilliseconds = certificationChallengeDetails.duration;

          // then
          const fiveMinutesInMilliseconds = 300000;
          assert.strictEqual(resultInMilliseconds, fiveMinutesInMilliseconds);
        });
      });
    });
  });
});

function createChallengesForAdministration(answerStatuses, store) {
  return answerStatuses.map((answerStatus, index) =>
    store.createRecord('certification-challenges-for-administration', {
      id: index,
      answerStatus,
      validatedLiveAlert: !answerStatus,
    }),
  );
}
