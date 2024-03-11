import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Timed challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let timedChallenge;

  module('Timed Challenge', function () {
    module('when asking for confirmation', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should hide the challenge statement', async function (assert) {
        assert.dom('.challenge-statement').doesNotExist();
      });

      test('should ensure the challenge does not automatically start', async function (assert) {
        assert.dom('.timeout-gauge').doesNotExist();
      });
    });

    module('when the confirmation button is clicked', function () {
      module('and the challenge has not been already answered', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
          await click('.timed-challenge-instructions button');
        });

        test('should hide the warning button', function (assert) {
          assert.dom('.timed-challenge-instructions button').doesNotExist();
        });

        test('should display the challenge statement and the feedback form', function (assert) {
          assert.dom('.challenge-statement').exists();
          assert.dom('.feedback-panel').exists();
        });

        test('should start the timer', function (assert) {
          assert.dom('.timeout-gauge').exists();
        });
      });

      module('and the challenge has already been skipped before', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
          server.create('answer', 'skipped', {
            assessment,
            challenge: timedChallenge,
          });

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
        });

        test('should hide the warning button', function (assert) {
          assert.dom('.timed-challenge-instructions button').doesNotExist();
        });

        test('should display the challenge statement and the feedback form', function (assert) {
          assert.dom('.challenge-statement').exists();
          assert.dom('.feedback-panel').exists();
        });

        test('should not display the timer', function (assert) {
          assert.dom('.timeout-gauge').doesNotExist();
        });
      });
    });

    module('when the challenge is already timeout', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType', 'withCurrentChallengeTimeout');
        timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should hide the warning button', function (assert) {
        assert.dom('.timed-challenge-instructions button').doesNotExist();
      });

      test('should display the challenge statement and the feedback form', function (assert) {
        assert.dom('.challenge-statement').exists();
        assert.dom('.feedback-panel').exists();
      });

      test('should display the timer without time remains', function (assert) {
        assert.ok(find('[data-test="timeout-gauge-remaining"]').textContent.includes('0:00'));
      });

      test('should only display continue button', function (assert) {
        assert.dom('.challenge-actions__action-skip').doesNotExist();
        assert.dom('.challenge-actions__action-validate').doesNotExist();
        assert.dom('.challenge-actions__action-continue').exists();
      });
    });
  });
  module('when user seen two timed challenge', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
      server.create('challenge', 'forCompetenceEvaluation', 'timed');

      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);
      await click('.timed-challenge-instructions button');
      await click('.challenge-actions__action-skip');
    });

    test('should hide the challenge statement of the second challenge', async function (assert) {
      assert.dom('.challenge-statement').doesNotExist();
    });

    test('should ensure the challenge does not automatically start of the second challenge', async function (assert) {
      assert.dom('.timeout-gauge').doesNotExist();
    });
  });

  module('Not Timed Challenge', function (hooks) {
    hooks.beforeEach(function () {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation');
    });

    test('should display the challenge statement', async function (assert) {
      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom('.challenge-statement').exists();
    });
  });
});
