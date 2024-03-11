import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Compare answers and solutions for QROC questions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;

  hooks.beforeEach(function () {
    assessment = this.server.create('assessment', 'ofCompetenceEvaluationType');
    const challenge = this.server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    this.server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
  });

  module('From the results page', function () {
    test('should display the REPONSE link from the results screen', async function (assert) {
      // given & when
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // then
      assert.ok(screen.getByRole('button', { name: 'Réponses et tutos' }));
    });

    test('should not yet display the modal nor its content', async function (assert) {
      // given & when
      await visit(`/assessments/${assessment.id}/results`);

      // then
      assert.dom('.pix-modal__overlay--hidden .comparison-window').exists();
      assert.dom('.comparison-window__header .comparison-window__result-item-index').doesNotExist();
      assert.dom('.comparison-window__header .comparison-window__title .comparison-window__title-text').doesNotExist();
    });
  });

  module('Content of the correction modal', function () {
    test('should be able to access the modal directly from the url', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      assert.dom('.pix-modal__overlay--hidden .comparison-window').doesNotExist();
      assert.dom('.pix-modal__overlay .comparison-window').exists();
    });

    test('should contain an instruction', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      assert.dom('.comparison-window-content__body .challenge-statement-instruction__text').exists();
    });

    test('should contain a correction zone', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      assert.dom('div[data-test-id="comparison-window__corrected-answers--qroc"]').exists();
    });

    test('should contain a zone reserved for feedback panel', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      assert.dom('.feedback-panel__open-button').exists();
    });
  });
});
