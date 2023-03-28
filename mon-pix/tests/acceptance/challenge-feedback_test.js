import { blur, click, fillIn, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEXTAREA = 'textarea.feedback-panel__field--content';
const DROPDOWN = '.feedback-panel__dropdown';

module('Acceptance | Giving feedback about a challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let firstChallenge;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    firstChallenge = server.create('challenge', 'forCompetenceEvaluation');
    server.create('challenge', 'forCompetenceEvaluation');
  });

  module('From a challenge', function (hooks) {
    hooks.beforeEach(async function () {
      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should be able to directly send a feedback', async function (assert) {
      // then
      assert.dom('.feedback-panel').exists();
    });

    module('when the feedback-panel button is clicked', function (hooks) {
      hooks.beforeEach(async function () {
        await click('.feedback-panel__open-button');
      });

      test('should open the feedback form', function (assert) {
        // then
        assert.dom('.feedback-panel__form').exists();
      });

      module('and the form is filled but not sent', function (hooks) {
        hooks.beforeEach(async function () {
          await fillIn(DROPDOWN, 'accessibility');
          await fillIn(TEXTAREA, 'TEST_CONTENT');
          await blur(TEXTAREA);
        });

        module('and the challenge is skipped', function (hooks) {
          hooks.beforeEach(async function () {
            await click('.challenge-actions__action-skip');
          });

          test('should not display the feedback form', function (assert) {
            // then
            assert.dom('.feedback-panel__form').doesNotExist();
          });

          test('should always reset the feedback form between two consecutive challenges', async function (assert) {
            await click('.feedback-panel__open-button');
            await fillIn(DROPDOWN, 'accessibility');

            assert.strictEqual(find(TEXTAREA).value, '');
          });
        });
      });
    });
  });

  module('From the comparison modal at the end of the test', function (hooks) {
    hooks.beforeEach(async function () {
      server.create('answer', 'skipped', { assessment, challenge: firstChallenge });
      await visit(`/assessments/${assessment.id}/checkpoint`);
    });
    test('should not display the feedback form', async function (assert) {
      // when
      await click('.result-item__correction-button');

      // then
      assert.dom('.feedback-panel__form').doesNotExist();
    });

    test('should be able to give feedback', async function (assert) {
      // when
      await click('.result-item__correction-button');
      await click('.feedback-panel__open-button');

      // then
      assert.dom('.feedback-panel__form').exists();
    });
  });
});
