// eslint-disable-next-line no-restricted-imports
import { click, fillIn, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

const TEXTAREA = '.feedback-panel__field--content';
const DROPDOWN = '.pix-select-button';

module('Acceptance | Giving feedback about a challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
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
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);
      // then
      assert.dom(screen.getByRole('button', { name: 'Signaler un problème' })).exists();
    });

    module('when the feedback-panel button is clicked', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        screen = await visit(`/assessments/${assessment.id}/challenges/0`);
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));
      });

      test('should open the feedback form', function (assert) {
        // then
        assert.dom('.feedback-panel__form').exists();
      });

      module('and the form is filled but not sent', function (hooks) {
        hooks.beforeEach(async function () {
          await click(screen.getByRole('button', { name: 'Sélectionner la catégorie du problème rencontré' }));
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'),
            })
          );
          const contentValue = 'Prêtes-moi ta plume, pour écrire un mot';
          await fillIn(
            screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }),
            contentValue
          );
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
            await click(screen.getByRole('button', { name: 'Signaler un problème' }));
            await click(screen.getByRole('button', { name: 'Sélectionner la catégorie du problème rencontré' }));
            await screen.findByRole('listbox');
            await click(
              screen.getByRole('option', {
                name: this.intl.t(
                  'pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'
                ),
              })
            );

            assert.strictEqual(
              screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }).value,
              ''
            );
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
