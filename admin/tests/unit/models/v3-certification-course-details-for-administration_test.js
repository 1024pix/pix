import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

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
