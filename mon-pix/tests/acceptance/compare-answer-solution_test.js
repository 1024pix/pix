import { click, find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Compare answers and solutions for QCM questions', function (hooks) {
  setupApplicationTest(hooks);
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
      assert.dom(findAll('.result-item')[0].textContent).hasText('Réponses et tutos'); //QCU
      assert.dom(findAll('.result-item')[1].textContent).hasText('Réponses et tutos'); //QCM
      assert.dom(findAll('.result-item')[2].textContent).hasText('Réponses et tutos'); //QROC
      assert.dom(findAll('.result-item')[3].textContent).doesNotHaveText('Réponses et tutos'); //QROCM
      assert.dom(findAll('.result-item')[4].textContent).hasText('Réponses et tutos'); //QROCMind
    });
  });

  module('Content of the correction modal', function () {
    test('should be able to open the correction modal', async function (assert) {
      await visit(`/assessments/${assessment.id}/results`);
      assert.dom(find('.comparison-window')).doesNotExist();

      await click('.result-item__correction-button');
      assert.dom(find('.comparison-window')).exists();
    });
  });

  module('Content of the correction modal: results and instructions', function () {
    test('should check the presence of instruction, text and image', async function (assert) {
      await visit(`/assessments/${assessment.id}/results`);
      await click('.result-item__correction-button');

      assert.dom(find('.comparison-window-content__body .challenge-statement-instruction__text')).exists();
      assert.dom(find('.comparison-window-content__body .challenge-statement__illustration-section')).exists();
    });
  });
});
