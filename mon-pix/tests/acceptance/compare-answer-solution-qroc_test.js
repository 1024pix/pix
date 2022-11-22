import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';

describe('Acceptance | Compare answers and solutions for QROC questions', function () {
  setupApplicationTest();
  setupMirage();
  let assessment;

  beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    const challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
  });

  describe('From the results page', function () {
    it('should display the REPONSE link from the results screen', async function () {
      // given & when
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // then
      expect(screen.getByRole('button', { name: 'Réponses et tutos' })).to.exist;
    });

    it('should not yet display the modal nor its content', async function () {
      // given & when
      await visit(`/assessments/${assessment.id}/results`);

      // then
      expect(find('.comparison-window')).to.be.null;
      expect(find('.comparison-window__header .comparison-window__result-item-index')).to.be.null;
      expect(find('.comparison-window__header .comparison-window__title .comparison-window__title-text')).to.be.null;
    });
  });

  describe('Content of the correction modal', function () {
    it('should be able to access the modal directly from the url', async function () {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      expect(find('.pix-modal__overlay--hidden')).to.not.exist;
      expect(find('.pix-modal__overlay')).to.exist;
    });

    it('should contain an instruction', async function () {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      expect(find('.comparison-window-content__body .challenge-statement-instruction__text')).to.exist;
    });

    it('should contain a correction zone', async function () {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      expect(find('div[data-test-id="comparison-window__corrected-answers--qroc"]')).to.exist;
    });

    it('should contain a zone reserved for feedback panel', async function () {
      // given
      const screen = await visit(`/assessments/${assessment.id}/results`);

      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      expect(find('.feedback-panel__open-button')).to.exist;
    });
  });
});
