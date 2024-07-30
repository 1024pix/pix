import { clickByText, visit } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

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
      await visit(`/assessments/${assessment.id}/results`);
      assert.ok(findAll('.result-item')[0].textContent.includes('Réponses et tutos')); //QCU
      assert.ok(findAll('.result-item')[1].textContent.includes('Réponses et tutos')); //QCM
      assert.ok(findAll('.result-item')[2].textContent.includes('Réponses et tutos')); //QROC
      assert.notOk(findAll('.result-item')[3].textContent.includes('Réponses et tutos')); //QROCM
      assert.ok(findAll('.result-item')[4].textContent.includes('Réponses et tutos')); //QROCMind
    });
  });

  module('Content of the correction modal', function () {
    test('should be able to open the correction modal', async function (assert) {
      // given & when
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // then
      assert.notOk(screen.queryByRole('dialog', { name: 'Vous n’avez pas la bonne réponse' }));

      await click('.result-item__correction-button');

      assert.dom('.pix-modal__overlay--hidden .comparison-window').doesNotExist();
      assert.dom('.pix-modal__overlay .comparison-window').exists();
    });

    test('should be able to send a feedback', async function (assert) {
      // given
      await visit(`/assessments/${assessment.id}/results`);
      await click('.result-item__correction-button');

      // when
      await clickByText(this.intl.t('pages.challenge.feedback-panel.actions.open-close'));

      await clickByLabel(this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.aria-first'));
      await clickByText(this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.question'));

      await clickByLabel(this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.aria-secondary'));
      await clickByText(
        this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.options.question-not-understood'),
      );

      await clickByText(this.intl.t('pages.challenge.feedback-panel.form.actions.submit'));
      await clickByText(this.intl.t('common.actions.validate'));

      // then
      assert.dom('.feedback-panel__view--mercix').exists();
    });
  });

  module('Content of the correction modal: results and instructions', function () {
    test('should check the presence of instruction, text and image', async function (assert) {
      await visit(`/assessments/${assessment.id}/results`);
      await click('.result-item__correction-button');

      assert.dom('.comparison-window-content__body .challenge-statement-instruction__text').exists();
      assert.dom('.comparison-window-content__body .challenge-statement__illustration-section').exists();
    });
  });
});
