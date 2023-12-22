import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/certifications/certification/informations', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#assignQuestionNumberForDisplay', function () {
    test('it should return the model with the formatted question number for each associated challenge', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/details');
      controller.model = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          ['ko', null, 'ko', 'aband', null, null, 'ok'],
          store,
        ),
      });

      // when
      const updatedModel = controller.assignQuestionNumberForDisplay(controller.model);

      // then
      assert.strictEqual(updatedModel[0].questionNumber, '1');
      assert.strictEqual(updatedModel[1].questionNumber, '[2]');
      assert.strictEqual(updatedModel[2].questionNumber, '2');
      assert.strictEqual(updatedModel[3].questionNumber, '3');
      assert.strictEqual(updatedModel[4].questionNumber, '[4]');
      assert.strictEqual(updatedModel[5].questionNumber, '[4]');
      assert.strictEqual(updatedModel[6].questionNumber, '4');
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
