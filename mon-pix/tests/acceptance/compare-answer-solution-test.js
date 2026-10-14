import { clickByText, visit, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';
import { waitForDialog } from '../helpers/wait-for';

module('Compare answers and solutions for QCM questions', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);
  let assessment;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    let challenge = server.create('challenge', 'forCompetenceEvaluation', 'QCU');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
      correction: server.create('correction', {
        solution: '1',
        hint: 'Cliquer sur 1',
      }),
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QCM');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMind');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
  });

  module('From the results page', function () {
    test('should display the REPONSE link from the results screen for all known types of question', async function (assert) {
      const screen = await visit(`/assessments/${assessment.id}/results`);

      assert.ok(screen.getAllByRole('button', { name: 'Voir les réponses et les tutos' }).length, 4);
      assert
        .dom(
          within(screen.getByText(/^Question 4/).closest('div')).queryByRole('button', {
            name: 'Voir les réponses et les tutos',
          }),
        )
        .doesNotExist(); //QROCM
    });
  });

  module('Question titles on the results page', function () {
    test('should number each question', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // then
      const titles = screen.getAllByRole('heading', { level: 3 });
      assert.strictEqual(titles.length, 5);
      titles.forEach((title, index) => {
        assert.dom(title).includesText(`Question ${index + 1}`);
      });
    });
  });

  module('Content of the correction modal', function () {
    test('should be able to open the correction modal', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);
      assert.notOk(screen.queryByRole('dialog', { name: 'Vous n’avez pas la bonne réponse' }));
      const buttons = screen.getAllByRole('button', { name: 'Voir les réponses et les tutos' });

      // when
      await click(buttons[0]);
      await waitForDialog();

      // then
      assert.ok(screen.getByRole('dialog', { name: 'Vous n’avez pas la bonne réponse' }));
    });

    test('should be able to send a feedback', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);
      await click(screen.getAllByRole('button', { name: 'Voir les réponses et les tutos' })[0]);

      // when
      await clickByText('Signaler un problème avec la question');

      await clickByLabel("J'ai un problème avec");
      await clickByText('La question');

      await clickByLabel('Sélectionner une option pour préciser votre problème');
      await clickByText('Je ne comprends pas la question');

      await clickByText('Envoyer');
      await clickByText('Valider');

      // then
      assert.dom('.feedback-panel__view--mercix').exists();
    });
  });

  module('Content of the correction modal: results and instructions', function () {
    test('should check the presence of instruction, text and image', async function (assert) {
      const screen = await visit(`/assessments/${assessment.id}/results`);
      await click(screen.getAllByRole('button', { name: 'Voir les réponses et les tutos' })[0]);

      assert.dom('.comparison-window-content__body .challenge-statement-instruction__text').exists();
      assert.dom('.comparison-window-content__body .challenge-statement__illustration-section').exists();
    });
  });
});
