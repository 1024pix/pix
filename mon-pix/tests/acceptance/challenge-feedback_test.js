import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';

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
      assert.dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' })).exists();
    });

    module('when the feedback-panel button is clicked', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        screen = await visit(`/assessments/${assessment.id}/challenges/0`);
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
      });

      test('should open the feedback form', function (assert) {
        // then
        assert
          .dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' }))
          .hasAttribute('aria-expanded', 'true');
        assert.dom(screen.getByRole('button', { name: "J'ai un problème avec" })).exists();
      });

      module('and the form is filled but not sent', function (hooks) {
        hooks.beforeEach(async function () {
          await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'),
            }),
          );
          await click(
            screen.getByRole('button', {
              name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
            }),
          );
          const contentValue = 'Prêtes-moi ta plume, pour écrire un mot';
          await fillIn(
            screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }),
            contentValue,
          );
        });

        module('and the challenge is skipped', function (hooks) {
          hooks.beforeEach(async function () {
            await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));
          });

          test('should not display the feedback form', async function (assert) {
            // then
            assert
              .dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' }))
              .hasAttribute('aria-expanded', 'false');
            assert.dom(screen.queryByRole('button', { name: "J'ai un problème avec" })).doesNotExist();
          });

          test('should always reset the feedback form between two consecutive challenges', async function (assert) {
            await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
            await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
            await screen.findByRole('listbox');
            await click(
              screen.getByRole('option', {
                name: this.intl.t(
                  'pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility',
                ),
              }),
            );
            await click(
              screen.getByRole('button', {
                name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
              }),
            );

            assert.strictEqual(
              screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }).value,
              '',
            );
          });
        });
      });
    });
  });

  module('From the comparison modal at the end of the test', function (hooks) {
    let screen;
    hooks.beforeEach(async function () {
      server.create('answer', 'skipped', { assessment, challenge: firstChallenge });
      screen = await visit(`/assessments/${assessment.id}/checkpoint`);
    });
    test('should not display the feedback form', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));
      await screen.findByRole('dialog');

      // then
      assert
        .dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' }))
        .hasAttribute('aria-expanded', 'false');
      assert
        .dom(screen.queryByRole('button', { name: 'Sélectionner la catégorie du problème rencontré' }))
        .doesNotExist();
    });

    test('should be able to give feedback', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));
      await screen.findByRole('dialog');

      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert
        .dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' }))
        .hasAttribute('aria-expanded', 'true');
      assert.dom(screen.getByRole('button', { name: "J'ai un problème avec" })).exists();
    });
  });
});
