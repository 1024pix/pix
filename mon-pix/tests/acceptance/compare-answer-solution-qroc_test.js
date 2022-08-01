import { click, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Compare answers and solutions for QROC questions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    const challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
  });

  module('From the results page', function (hooks) {
    hooks.beforeEach(async function () {
      await visit(`/assessments/${assessment.id}/results`);
    });

    test('should display the REPONSE link from the results screen', async function (assert) {
      assert.dom(find('.result-item .js-correct-answer').textContent).hasText('Réponses et tutos');
    });

    test('should not yet display the modal nor its content', async function (assert) {
      assert.equal(find('.comparison-window'), null);
      assert.equal(find('.comparison-window__header .comparison-window__result-item-index'), null);
      assert.equal(find('.comparison-window__header .comparison-window__title .comparison-window__title-text'), null);
    });
  });

  module('Content of the correction modal', function (hooks) {
    hooks.beforeEach(async function () {
      await visit(`/assessments/${assessment.id}/results`);
      await click('.result-item:nth-child(1) .result-item__correction-button');
    });

    test('should be able to access the modal directly from the url', async function (assert) {
      assert.dom(find('.comparison-window')).exists();
    });

    test('should contain an instruction', async function (assert) {
      assert.dom(find('.comparison-window-content__body .challenge-statement-instruction__text')).exists();
    });

    test('should contain a correction zone', async function (assert) {
      assert.dom(find('div[data-test-id="comparison-window__corrected-answers--qroc"]')).exists();
    });

    test('should contain a zone reserved for feedback panel', async function (assert) {
      assert.dom(find('.comparison-window__feedback-panel')).exists();
    });

    test('should contain a closing button', async function (assert) {
      assert.dom(find('.pix-modal__close-link > span')).exists();
    });
  });
});
