import { click, find, findAll, currentURL } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Displaying a QCU challenge', () => {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let qcuChallenge;

  beforeEach(async () => {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    qcuChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QCU');
  });

  describe('When challenge is not already answered', () => {
    beforeEach(async () => {
      // when
      await visit(`/assessments/${assessment.id}/challenges/${qcuChallenge.id}`);
    });

    it('should render challenge information and question', () => {
      // then
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qcuChallenge.instruction);

      expect(findAll('input[type=radio][name="radio"]')).to.have.lengthOf(4);
      expect(findAll('.proposal-text')[0].textContent.trim()).to.equal('1ere possibilite');
      expect(findAll('.proposal-text')[1].textContent.trim()).to.equal('2eme possibilite');
      expect(findAll('.proposal-text')[2].textContent.trim()).to.equal('3eme possibilite');
      expect(findAll('.proposal-text')[3].textContent.trim()).to.equal('4eme possibilite');

      expect(find('.alert')).to.not.exist;

    });

    it('should display the alert box if user validates without checking a radio button', async () => {
      // when
      await click('.challenge-actions__action-validate');

      // then
      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, sélectionner une réponse. Sinon, passer.');
    });

    it('should hide the alert error after the user interact with radio button', async () => {
      // given
      await click('.challenge-actions__action-validate');

      // when
      await click(findAll('.proposal-text')[1]);

      // then
      expect(find('.alert')).to.not.exist;
    });

    it('should go to checkpoint when user validated', async () => {
      // when
      await click(findAll('.proposal-text')[1]);
      await click('.challenge-actions__action-validate');

      // then
      expect(currentURL()).to.contains(`/assessments/${assessment.id}/checkpoint`);
    });

  });

  describe('When challenge is already answered', () => {
    beforeEach(async () => {
      // given
      server.create('answer', {
        value: '2',
        result: 'ko',
        assessment,
        challenge: qcuChallenge,
      });

      // when
      await visit(`/assessments/${assessment.id}/challenges/${qcuChallenge.id}`);
    });

    it('should mark radio button corresponding to the answer and propose to continue', async () => {
      // then
      const radioButtons = findAll('input[type=radio][name="radio"]');
      expect(radioButtons[0].checked).to.be.false;
      expect(radioButtons[1].checked).to.be.true;
      expect(radioButtons[2].checked).to.be.false;
      expect(radioButtons[3].checked).to.be.false;

      findAll('input[type=radio][name="radio"]').forEach((radioButton) => expect(radioButton.disabled).to.equal(true));

      expect(find('.challenge-actions__action-continue')).to.exist;
      expect(find('.challenge-actions__action-validate')).to.not.exist;
      expect(find('.challenge-actions__action-skip-text')).to.not.exist;

    });
  });

  describe('When challenge is already answered and user wants to see answers', () => {
    let correction, tutorial, learningMoreTutorial;
    beforeEach(async () => {
      // given
      tutorial = server.create('tutorial');
      learningMoreTutorial = server.create('tutorial');
      correction = server.create('correction', {
        solution: '1',
        hint: 'Cliquer sur 1',
        tutorials: [tutorial],
        learningMoreTutorials: [learningMoreTutorial]
      });
      server.create('answer', {
        value: '2',
        result: 'ko',
        assessmentId: assessment.id,
        challengeId :qcuChallenge.id,
        correction
      });

      // when
      await visit(`/assessments/${assessment.id}/checkpoint`);
    });

    it('should show the result of previous challenge in checkpoint', async () => {
      // then
      expect(find('.result-item__icon').title).to.equal('Réponse incorrecte');
      expect(find('.result-item__instruction').textContent.trim()).to.equal(qcuChallenge.instruction);
      expect(find('.result-item__correction-button').textContent.trim()).to.equal('Réponses et tutos');
    });

    it('should show details of challenge result in pop-in, with tutorials and feedbacks', async () => {
      // when
      await click('.result-item__correction-button');

      // then
      expect(find('.comparison-window__title-text').textContent.trim()).to.equal('Vous n’avez pas la bonne réponse');
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qcuChallenge.instruction);

      const goodAnswer = findAll('.qcu-proposal-label__oracle')[0];
      const badAnswerFromUserResult = findAll('.qcu-proposal-label__oracle')[1];
      expect(goodAnswer.getAttribute('data-goodness')).to.equal('good');
      expect(goodAnswer.getAttribute('data-checked')).to.equal('no');
      expect(badAnswerFromUserResult.getAttribute('data-goodness')).to.equal('bad');
      expect(badAnswerFromUserResult.getAttribute('data-checked')).to.equal('yes');

      expect(find('.tutorial-panel__hint-container').textContent).to.contains(correction.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-item')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-item')[0];

      expect(tutorialToSuccess.textContent).to.contains(tutorial.title);
      expect(tutorialToLearnMore.textContent).to.contains(learningMoreTutorial.title);

      expect(find('.feedback-panel')).to.exist;

    });
  });
});

