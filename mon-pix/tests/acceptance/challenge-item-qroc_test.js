import { click, find, findAll, currentURL, fillIn, triggerEvent } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByEmail } from '../helpers/authentication';

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
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply', 'withEmbed');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply', 'withEmbed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-skip-text');
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-response__proposal')).to.not.exist;
      });

      it('should display the alert box when user validates without successfully finishing the embed', async () => {
        // when
        expect(find('.alert')).to.not.exist;
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.alert')).to.exist;
        expect(find('.alert').textContent.trim()).to.equal('“Vous pouvez valider” s‘affiche quand l‘épreuve est réussie. Essayez encore ou passez.');
      });

      it('should go to the next challenge when user validates after finishing successfully the embed', async () => {
        // when
        const event = document.createEvent('Event');
        event.initEvent('message', true, true);
        event.data = 'custom answer from embed';
        event.origin = 'https://epreuves.pix.fr';
        find('.embed__iframe').dispatchEvent(event);

        // then
        await click('.challenge-actions__action-validate');
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/challenges/2`);
      });
    });

    describe('When challenge is an embed (without autoreply)', () => {
      beforeEach(async () => {
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withEmbed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-skip-text');
      });

      it('should display the alert box when user validates without successfully answering', async () => {
        // when
        const event = document.createEvent('Event');
        event.initEvent('message', true, true);
        event.data = 'custom answer from embed';
        event.origin = 'https://epreuves.pix.fr';
        find('.embed__iframe').dispatchEvent(event);

        // then
        await click('.challenge-actions__action-validate');
        expect(find('.alert').textContent.trim()).to.equal('Pour valider, veuillez remplir le champ texte. Sinon, passez.');
      });
    });

    describe('When challenge is not already answered', () => {
      beforeEach(async () => {
        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocChallenge.instruction);

        expect(findAll('.challenge-response__proposal')).to.have.lengthOf(1);
        expect(find('.challenge-response__proposal').disabled).to.be.false;

        expect(findAll('.qroc_input-label')[0].innerHTML).to.contain('Entrez le <em>prénom</em> de B. Gates :');

        expect(find('.alert')).to.not.exist;

      });

      it('should display the alert box if user validates without write an answer in input', async () => {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', '');
        expect(find('.alert')).to.not.exist;
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.alert')).to.exist;
        expect(find('.alert').textContent.trim()).to.equal('Pour valider, veuillez remplir le champ texte. Sinon, passez.');
      });

      it('should hide the alert error after the user interact with input text', async () => {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('input', 'keyup');
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
        await visit(`/assessments/${assessment.id}/challenges/0`);
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
          learningMoreTutorials: [learningMoreTutorial],
        });
        server.create('answer', {
          value: 'Banane',
          result: 'ko',
          assessmentId: assessment.id,
          challengeId: qrocChallenge.id,
          correction,
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
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocChallenge.instruction);

        const goodAnswer = find('.comparison-window-solution__text');
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

        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should display the correct challenge for first one', async function() {
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocWithFile1Challenge.instruction);
        expect(find('.challenge-statement__action-link').href).to.contains(qrocWithFile1Challenge.attachments[0]);

        await click(find('#attachment1'));
        expect(find('.challenge-statement__action-link').href).to.contains(qrocWithFile1Challenge.attachments[1]);
      });

      it('should display the error alert if the users tries to validate an empty answer', async function() {
        await click(find('.challenge-actions__action-skip'));

        expect(currentURL()).to.equal(`/assessments/${assessment.id}/challenges/1`);
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocWithFile2Challenge.instruction);
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
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocChallenge.instruction);

        expect(findAll('.challenge-response__proposal')).to.have.lengthOf(1);
        expect(find('.challenge-response__proposal').disabled).to.be.false;
        expect(findAll('.qroc_input-label')[0].innerHTML).to.contain('Entrez le <em>prénom</em> de B. Gates :');

        expect(find('.alert')).to.not.exist;

      });

      it('should display the alert box if user validates without write an answer in input', async () => {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', '');
        expect(find('.alert')).to.not.exist;
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.alert')).to.exist;
        expect(find('.alert').textContent.trim()).to.equal('Pour valider, veuillez remplir le champ texte. Sinon, passez.');
      });

      it('should hide the alert error after the user interact with input text', async () => {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('textarea', 'keyup');
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
          learningMoreTutorials: [learningMoreTutorial],
        });
        server.create('answer', {
          value: 'Banane',
          result: 'ko',
          assessmentId: assessment.id,
          challengeId: qrocChallenge.id,
          correction,
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
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocChallenge.instruction);

        const goodAnswer = find('.comparison-window-solution__text');
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

  describe('with select format', () => {
    beforeEach(async () => {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCWithSelect');
    });

    describe('When challenge is not already answered', () => {
      beforeEach(async () => {
        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should render challenge information and question', () => {
        // then
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocChallenge.instruction);
        expect(findAll('.challenge-response__proposal')).to.have.lengthOf(1);
        expect(find('[data-test="challenge-response-proposal-selector"]').disabled).to.be.false;
        expect(findAll('.qroc_input-label')[0].innerHTML).to.contain('Select: ');

        expect(find('.alert')).to.not.exist;

      });

      it('should hide the alert error after the user interact with input text', async () => {
        // given
        await click('.challenge-actions__action-validate');
        expect(find('.alert')).to.exist;
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[1];
        console.log(optionToFillIn);
        // when
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);

        // then
        expect(find('.alert')).to.not.exist;
      });

      it('should go to checkpoint when user validated', async () => {
        // when
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[1];
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);

        await click('.challenge-actions__action-validate');

        // then
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/checkpoint`);
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
          learningMoreTutorials: [learningMoreTutorial],
        });
        server.create('answer', {
          value: 'Banane',
          result: 'ko',
          assessmentId: assessment.id,
          challengeId: qrocChallenge.id,
          correction,
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
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocChallenge.instruction);

        const goodAnswer = find('.comparison-window-solution__text');
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

  describe('when challenge is focused', () => {

    describe('when user has not seen the challenge tooltip yet', function() {
      beforeEach(async () => {
        const user = server.create('user', 'withEmail', {
          hasSeenFocusedChallengeTooltip: false,
        });
        await authenticateByEmail(user);
      });

      it('should display an overlay and tooltip', async () => {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withFocused');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        expect(find('.assessment-challenge__focused-overlay')).to.exist;
        expect(find('#challenge-statement-tag--tooltip')).to.exist;
      });

      it('should disable input and buttons', async () => {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withFocused');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.exist;
        expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.exist;
        expect(find('.challenge-response__proposal').getAttribute('disabled')).to.exist;
      });

      it('should not display an info alert with dashed border and overlay', async function() {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withFocused');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
        const challengeItem = find('.challenge-item');
        await triggerEvent(challengeItem, 'mouseleave');

        // then
        expect(find('.alert--info')).to.not.exist;
        expect(find('.challenge-item__container--focused')).to.not.exist;
        expect(find('.assessment-challenge__focused-out-overlay')).to.not.exist;
      });

      describe('when user closes tooltip', () => {
        beforeEach(async function() {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withFocused');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
          await click('[data-test="challenge-statement-tag-information__button"]');
        });

        it('should hide an overlay and tooltip', async () => {
          // then
          expect(find('.assessment-challenge__focused-overlay')).to.not.exist;
          expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
        });

        it('should enable input and buttons', async () => {
          // then
          expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
          expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
          expect(find('.challenge-response__proposal').getAttribute('disabled')).to.not.exist;
        });

        it('should display a warning alert', async function() {
          // when
          await triggerEvent(window, 'blur');

          // then
          expect(find('.alert--warning')).to.exist;
        });

        it('should display an info alert with dashed border and overlay', async function() {
          // when
          const challengeItem = find('.challenge-item');
          await triggerEvent(challengeItem, 'mouseleave');

          // then
          expect(find('.alert--info')).to.exist;
          expect(find('.challenge-item__container--focused')).to.exist;
          expect(find('.assessment-challenge__focused-out-overlay')).to.exist;
        });

        it('should display only the warning alert when it has been triggered', async function() {
          // when
          const challengeItem = find('.challenge-item');
          await triggerEvent(challengeItem, 'mouseleave');

          // then
          expect(find('.alert--info')).to.exist;
          expect(find('.challenge-item__container--focused')).to.exist;
          expect(find('.assessment-challenge__focused-out-overlay')).to.exist;

          // when
          await triggerEvent(window, 'blur');

          expect(find('.alert--info')).to.not.exist;
          expect(find('.alert--warning')).to.exist;
          expect(find('.challenge-item__container--focused')).to.exist;
          expect(find('.assessment-challenge__focused-out-overlay')).to.exist;
        });
      });
    });

    describe('when user has already seen challenge tooltip', () => {
      beforeEach(async () => {
        const user = server.create('user', 'withEmail', {
          hasSeenFocusedChallengeTooltip: true,
        });
        await authenticateByEmail(user);

        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withFocused');

        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should hide the overlay and tooltip', async () => {
        // then
        expect(find('.assessment-challenge__focused-overlay')).to.not.exist;
        expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
      });

      it('should enable input and buttons', async () => {
        // then
        expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
        expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
        expect(find('.challenge-response__proposal').getAttribute('disabled')).to.not.exist;
      });
    });
  });

  describe('when challenge is not focused', () => {
    it('should not display an overlay nor a tooltip', async () => {
      // given
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation', 'QROC');

      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      expect(find('.assessment-challenge__focused-overlay')).to.not.exist;
      expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
    });

    describe('when user has focused out of document', function() {
      beforeEach(async function() {
        // given
        const user = server.create('user', 'withEmail');
        await authenticateByEmail(user);
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should not display instructions', async function() {
        // then
        expect(find('.focused-challenge-instructions-action__confirmation-button')).to.not.exist;
      });

      it('should not display a warning alert', async function() {
        // when
        await triggerEvent(window, 'blur');
        // then
        expect(find('.alert--warning')).to.not.exist;
      });
    });
  });
});
