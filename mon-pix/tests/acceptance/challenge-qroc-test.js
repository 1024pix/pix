import { click, find, findAll, currentURL, fillIn, triggerEvent } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Displaying a QROC challenge', () => {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let qrocChallenge;

  describe('with input format', () => {
    beforeEach(async () => {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    });

    describe('When challenge is an auto validated embed (autoReply=true)', () => {
      beforeEach(async () => {
        const qrocChallengeWithAutoReply = server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply');
        // when
        await visit(`/assessments/${assessment.id}/challenges/${qrocChallengeWithAutoReply.id}`);
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-response__proposal')).to.not.exist;
      });

      it('should display the alert box when user validates', async () => {
        // when
        expect(find('.alert')).to.not.exist;
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.alert')).to.exist;
        expect(find('.alert').textContent.trim()).to.equal('Jouer l\'épreuve pour valider. Sinon, passer.');
      });

    });

    describe('When challenge is not already answered', () => {
      beforeEach(async () => {
        // when
        await visit(`/assessments/${assessment.id}/challenges/${qrocChallenge.id}`);
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);

        expect(findAll('.challenge-response__proposal')).to.have.lengthOf(1);
        expect(find('.challenge-response__proposal').disabled).to.be.false;

        expect(find('.alert')).to.not.exist;

      });

      it('should display the alert box if user validates without write an answer in input', async () => {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', '');
        expect(find('.alert')).to.not.exist;
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.alert')).to.exist;
        expect(find('.alert').textContent.trim()).to.equal('Jouer l\'épreuve pour valider. Sinon, passer.');
      });

      it('should hide the alert error after the user interact with input text', async () => {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('input', 'keydown');
        await fillIn('input[data-uid="qroc-proposal-uid"]', 'Test');

        // then
        expect(find('.alert')).to.not.exist;
      });

      it('should go to checkpoint when user validated', async () => {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', 'Test');
        await click('.challenge-actions__action-validate');

        // then
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/checkpoint`);
      });

    });

    describe('When challenge is already answered', () => {
      beforeEach(async () => {
        // given
        server.create('answer', {
          value: 'Reponse',
          result: 'ko',
          assessment,
          challenge: qrocChallenge,
        });

        // when
        await visit(`/assessments/${assessment.id}/challenges/${qrocChallenge.id}`);
      });

      it('should set the input value with the current answer and propose to continue', async () => {
        // then
        expect(find('.challenge-response__proposal').value).to.equal('Reponse');
        expect(find('.challenge-response__proposal').disabled).to.be.true;

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
          solution: 'Mangue',
          hint: 'Manger des fruits',
          tutorials: [tutorial],
          learningMoreTutorials: [learningMoreTutorial]
        });
        server.create('answer', {
          value: 'Banane',
          result: 'ko',
          assessmentId: assessment.id,
          challengeId: qrocChallenge.id,
          correction
        });

        // when
        await visit(`/assessments/${assessment.id}/checkpoint`);
      });

      it('should show the result of previous challenge in checkpoint', async () => {
        // then
        expect(find('.result-item__icon').title).to.equal('Réponse incorrecte');
        expect(find('.result-item__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);
        expect(find('.result-item__correction-button').textContent.trim()).to.equal('Réponses et tutos');
      });

      it('should show details of challenge result in pop-in, with tutorials and feedbacks', async () => {
        // when
        await click('.result-item__correction-button');

        // then
        expect(find('.comparison-window__title-text').textContent.trim()).to.equal('Vous n’avez pas la bonne réponse');
        expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);

        const goodAnswer = find('.correction-qroc-box__solution');
        const badAnswerFromUserResult = find('.correction-qroc-box-answer');
        expect(goodAnswer.textContent.trim()).to.equal('Mangue');
        expect(badAnswerFromUserResult.className).contains('correction-qroc-box-answer--wrong');
        expect(badAnswerFromUserResult.value).to.equal('Banane');

        expect(find('.tutorial-panel__hint-container').textContent).to.contains(correction.hint);

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-item')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-item')[0];

        expect(tutorialToSuccess.textContent).to.contains(tutorial.title);
        expect(tutorialToLearnMore.textContent).to.contains(learningMoreTutorial.title);

        expect(find('.feedback-panel')).to.exist;

      });
    });

    describe('When there is two challenges with download file', () => {
      let qrocWithFile1Challenge, qrocWithFile2Challenge;

      beforeEach(async function() {
        qrocWithFile1Challenge = server.create('challenge', 'forDemo', 'QROCwithFile1');
        qrocWithFile2Challenge = server.create('challenge', 'forDemo', 'QROCwithFile2');
        assessment = server.create('assessment', 'ofDemoType');

        await visit(`/assessments/${assessment.id}/challenges/${qrocWithFile1Challenge.id}`);
      });

      it('should display the correct challenge for first one', async function() {
        expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocWithFile1Challenge.instruction);
        expect(find('.challenge-statement__action-link').href).to.contains(qrocWithFile1Challenge.attachments[0]);

        await click(find('#attachment1'));
        expect(find('.challenge-statement__action-link').href).to.contains(qrocWithFile1Challenge.attachments[1]);
      });

      it('should display the error alert if the users tries to validate an empty answer', async function() {
        await click(find('.challenge-actions__action-skip'));

        expect(currentURL()).to.equal(`/assessments/${assessment.id}/challenges/${qrocWithFile2Challenge.id}`);
        expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocWithFile2Challenge.instruction);
        expect(find('.challenge-statement__action-link').href).to.contains(qrocWithFile2Challenge.attachments[0]);

        await click(find('#attachment1'));
        expect(find('.challenge-statement__action-link').href).to.contains(qrocWithFile2Challenge.attachments[1]);

      });

    });
  });

  describe('with text-area format', () => {
    beforeEach(async () => {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withTextArea');
    });

    describe('When challenge is not already answered', () => {
      beforeEach(async () => {
        // when
        await visit(`/assessments/${assessment.id}/challenges/${qrocChallenge.id}`);
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);

        expect(findAll('.challenge-response__proposal')).to.have.lengthOf(1);
        expect(find('.challenge-response__proposal').disabled).to.be.false;

        expect(find('.alert')).to.not.exist;

      });

      it('should display the alert box if user validates without write an answer in input', async () => {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', '');
        expect(find('.alert')).to.not.exist;
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.alert')).to.exist;
        expect(find('.alert').textContent.trim()).to.equal('Jouer l\'épreuve pour valider. Sinon, passer.');
      });

      it('should hide the alert error after the user interact with input text', async () => {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('textarea', 'keydown');
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'Test');

        // then
        expect(find('.alert')).to.not.exist;
      });

      it('should go to checkpoint when user validated', async () => {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'Test');
        await click('.challenge-actions__action-validate');

        // then
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/checkpoint`);
      });

    });

    describe('When challenge is already answered', () => {
      beforeEach(async () => {
        // given
        server.create('answer', {
          value: 'Reponse',
          result: 'ko',
          assessment,
          challenge: qrocChallenge,
        });

        // when
        await visit(`/assessments/${assessment.id}/challenges/${qrocChallenge.id}`);
      });

      it('should set the input value with the current answer and propose to continue', async () => {
        // then
        expect(find('.challenge-response__proposal').value).to.equal('Reponse');
        expect(find('.challenge-response__proposal').disabled).to.be.true;

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
          solution: 'Mangue',
          hint: 'Manger des fruits',
          tutorials: [tutorial],
          learningMoreTutorials: [learningMoreTutorial]
        });
        server.create('answer', {
          value: 'Banane',
          result: 'ko',
          assessmentId: assessment.id,
          challengeId: qrocChallenge.id,
          correction
        });

        // when
        await visit(`/assessments/${assessment.id}/checkpoint`);
      });

      it('should show the result of previous challenge in checkpoint', async () => {
        // then
        expect(find('.result-item__icon').title).to.equal('Réponse incorrecte');
        expect(find('.result-item__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);
        expect(find('.result-item__correction-button').textContent.trim()).to.equal('Réponses et tutos');
      });

      it('should show details of challenge result in pop-in, with tutorials and feedbacks', async () => {
        // when
        await click('.result-item__correction-button');

        // then
        expect(find('.comparison-window__title-text').textContent.trim()).to.equal('Vous n’avez pas la bonne réponse');
        expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);

        const goodAnswer = find('.correction-qroc-box__solution');
        const badAnswerFromUserResult = find('.correction-qroc-box-answer');
        expect(goodAnswer.textContent.trim()).to.equal('Mangue');
        expect(badAnswerFromUserResult.className).contains('correction-qroc-box-answer--wrong');
        expect(badAnswerFromUserResult.value).to.equal('Banane');

        expect(find('.tutorial-panel__hint-container').textContent).to.contains(correction.hint);

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-item')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-item')[0];

        expect(tutorialToSuccess.textContent).to.contains(tutorial.title);
        expect(tutorialToLearnMore.textContent).to.contains(learningMoreTutorial.title);

        expect(find('.feedback-panel')).to.exist;

      });
    });
  });

});
