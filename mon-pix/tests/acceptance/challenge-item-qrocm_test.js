import { click, find, findAll, currentURL, fillIn, triggerEvent, visit } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Displaying a QROCM challenge', function () {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let qrocmDepChallenge;

  beforeEach(async function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
  });

  describe('When challenge is not already answered', function () {
    context('and challenge only has input fields', function () {
      beforeEach(async function () {
        // when
        qrocmDepChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMDep');
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should render challenge information and question', function () {
        // then
        expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(
          qrocmDepChallenge.instruction
        );

        expect(findAll('.challenge-response__proposal')).to.have.lengthOf(2);
        expect(findAll('.challenge-response__proposal')[0].disabled).to.be.false;
        expect(findAll('.challenge-response__proposal')[1].disabled).to.be.false;
        expect(find('div[data-test="qrocm-label-0"]').innerHTML).to.contains('Station <strong>1</strong> :');
        expect(find('div[data-test="qrocm-label-1"]').innerHTML).to.contains('Station <em>2</em> :');

        expect(find('.challenge-response__alert')).to.not.exist;
      });

      it('should display the alert box if user validates without write an answer for each input', async function () {
        // when
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], '');

        await click(find('.challenge-actions__action-validate'));

        expect(find('.challenge-response__alert')).to.exist;
        expect(find('.challenge-response__alert').textContent.trim()).to.equal(
          'Pour valider, veuillez remplir tous les champs réponse. Sinon, passez.'
        );
      });

      it('should hide the alert error after the user interact with input text', async function () {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('input', 'keydown');
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], 'ANSWER');

        // then
        expect(find('.challenge-response__alert')).to.not.exist;
      });

      it('should go to checkpoint when user validated', async function () {
        // when
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], 'ANSWER');
        await click('.challenge-actions__action-validate');

        // then
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/checkpoint`);
      });
    });

    context('and challenge contains select field', function () {
      beforeEach(async function () {
        // when
        server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should not be able to validate with the initial option', async function () {
        // when
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.challenge-response__alert')).to.exist;
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should not be able to validate the empty option', async function () {
        // given
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[0];

        // when
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(find('.challenge-response__alert')).to.exist;
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should validate an option and redirect to next page', async function () {
        // given
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[1];

        // when
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);
        await click(find('.challenge-actions__action-validate'));

        // then
        expect(currentURL()).to.contains(`/assessments/${assessment.id}/checkpoint`);
      });
    });
  });

  describe('When challenge is already answered', function () {
    context('and challenge is only made of input fields', function () {
      beforeEach(async function () {
        // given
        qrocmDepChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMDep');
        server.create('answer', {
          value: "station1: 'Republique'\nstation2: 'Chatelet'\n",
          result: 'ko',
          assessment,
          challenge: qrocmDepChallenge,
        });

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should set the input text with previous answers and propose to continue', async function () {
        // then
        expect(find('div[data-test="qrocm-label-0"]').innerHTML).to.contains('Station <strong>1</strong> :');
        expect(find('div[data-test="qrocm-label-1"]').innerHTML).to.contains('Station <em>2</em> :');
        expect(findAll('.challenge-response__proposal')[0].value).to.equal('Republique');
        expect(findAll('.challenge-response__proposal')[1].value).to.equal('Chatelet');

        findAll('.challenge-response__proposal').forEach((input) => {
          expect(input.disabled).to.equal(true);
        });

        expect(find('.challenge-actions__action-continue')).to.exist;
        expect(find('.challenge-actions__action-validate')).to.not.exist;
        expect(find('.challenge-actions__action-skip-text')).to.not.exist;
      });
    });

    context('and challenge contains select field', function () {
      beforeEach(async function () {
        // given
        const qrocmWithSelectChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        server.create('answer', {
          value: "banana: 'mango'\n",
          result: 'ko',
          assessment,
          challenge: qrocmWithSelectChallenge,
        });

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should set the select with previous answer and propose to continue', async function () {
        // then
        expect(findAll('select[data-test="challenge-response-proposal-selector"] option')[1].hasAttribute('selected'));

        expect(find('.challenge-actions__action-continue')).to.exist;
        expect(find('.challenge-actions__action-validate')).to.not.exist;
        expect(find('.challenge-actions__action-skip-text')).to.not.exist;
      });
    });
  });

  describe('When challenge is already answered and user wants to see answers', function () {
    let correctionDep,
      correctionInd,
      tutorial,
      learningMoreTutorial,
      qrocmIndChallenge,
      qrocmIndSelectChallenge,
      correctionIndSelect;

    beforeEach(async function () {
      // given
      qrocmDepChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMDep');
      qrocmIndChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMind');
      qrocmIndSelectChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');

      tutorial = server.create('tutorial');
      learningMoreTutorial = server.create('tutorial');
      correctionDep = server.create('correction', {
        solution: 'station1:\n- Versailles-Chantiers\nstation2:\n- Poissy',
        hint: 'Sortir de paris !',
        tutorials: [tutorial],
        learningMoreTutorials: [learningMoreTutorial],
      });
      server.create('answer', {
        value: "station1: 'Republique'\nstation2: 'Chatelet'\n",
        result: 'ko',
        assessmentId: assessment.id,
        challengeId: qrocmDepChallenge.id,
        correction: correctionDep,
      });
      correctionInd = server.create('correction', {
        solution: 'titre:\n- Le petit prince\nauteur:\n- Saint-Exupéry',
        hint: 'Sortir de paris !',
        tutorials: [tutorial],
        learningMoreTutorials: [learningMoreTutorial],
      });
      server.create('answer', {
        value: "titre: 'Le rouge et le noir'\nauteur: 'Stendhal'\n",
        result: 'ko',
        assessmentId: assessment.id,
        challengeId: qrocmIndChallenge.id,
        correction: correctionInd,
      });

      correctionIndSelect = server.create('correction', {
        solution: 'banana:\n- mango',
        hint: 'Sortir de paris !',
        tutorials: [tutorial],
        learningMoreTutorials: [learningMoreTutorial],
      });
      server.create('answer', {
        value: "banana: 'potato'\n",
        result: 'ko',
        assessmentId: assessment.id,
        challengeId: qrocmIndSelectChallenge.id,
        correction: correctionIndSelect,
      });

      // when
      await visit(`/assessments/${assessment.id}/checkpoint`);
    });

    it('should show the result of previous challenges in checkpoint', async function () {
      // then
      expect(findAll('.result-item__icon')[0].title).to.equal('Réponse incorrecte');
      const instructionStripped = qrocmDepChallenge.instruction.slice(0, 102);
      expect(findAll('.result-item__instruction')[0].textContent.trim()).to.equal(`${instructionStripped}...`);
      expect(findAll('.result-item__correction-button')[0].textContent.trim()).to.equal('Réponses et tutos');

      expect(findAll('.result-item__icon')[1].title).to.equal('Réponse incorrecte');
      const instructionStrippedInd = qrocmIndChallenge.instruction.slice(0, 104);
      expect(findAll('.result-item__instruction')[1].textContent.trim()).to.equal(`${instructionStrippedInd}....`);
      expect(findAll('.result-item__correction-button')[1].textContent.trim()).to.equal('Réponses et tutos');

      expect(findAll('.result-item__icon')[2].title).to.equal('Réponse incorrecte');
      const instructionStrippedSelect = qrocmIndSelectChallenge.instruction.slice(0, 104);
      expect(findAll('.result-item__instruction')[2].textContent.trim()).to.equal(`${instructionStrippedSelect}....`);
      expect(findAll('.result-item__correction-button')[2].textContent.trim()).to.equal('Réponses et tutos');
    });

    it('should show details of QROCM-dep challenge result in pop-in, with tutorials and feedbacks', async function () {
      // when
      await click(findAll('.result-item__correction-button')[0]);

      // then
      expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocmDepChallenge.instruction);

      const goodAnswers = find('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      expect(goodAnswers.textContent.trim()).to.equal('Versailles-Chantiers et Poissy');
      expect(badAnswersFromUserResult[0].value).to.equal('Republique');
      expect(badAnswersFromUserResult[1].value).to.equal('Chatelet');

      expect(find('.tutorial-panel__hint-container').textContent).to.contains(correctionDep.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      expect(tutorialToSuccess.textContent).to.contains(tutorial.title);
      expect(tutorialToLearnMore.textContent).to.contains(learningMoreTutorial.title);

      expect(find('.feedback-panel')).to.exist;
    });

    it('should show details of QROCM-ind challenge result in pop-in, with tutorials and feedbacks', async function () {
      // when
      await click(findAll('.result-item__correction-button')[1]);

      // then
      expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(qrocmIndChallenge.instruction);

      const goodAnswers = findAll('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      expect(goodAnswers[0].textContent.trim()).to.equal('Le petit prince');
      expect(goodAnswers[1].textContent.trim()).to.equal('Saint-Exupéry');
      expect(badAnswersFromUserResult[0].value).to.equal('Le rouge et le noir');
      expect(badAnswersFromUserResult[1].value).to.equal('Stendhal');

      expect(find('.tutorial-panel__hint-container').textContent).to.contains(correctionDep.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      expect(tutorialToSuccess.textContent).to.contains(tutorial.title);
      expect(tutorialToLearnMore.textContent).to.contains(learningMoreTutorial.title);

      expect(find('.feedback-panel')).to.exist;
    });

    it('should show details of QROCM-ind challenge (with select) result in pop-in, with tutorials and feedbacks', async function () {
      // when
      await click(findAll('.result-item__correction-button')[2]);

      // then
      expect(find('.challenge-statement-instruction__text').textContent.trim()).to.equal(
        qrocmIndSelectChallenge.instruction
      );

      const goodAnswers = findAll('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      expect(goodAnswers[0].textContent.trim()).to.equal('mango');
      expect(badAnswersFromUserResult[0].value).to.equal('potato');

      expect(find('.tutorial-panel__hint-container').textContent).to.contains(correctionIndSelect.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      expect(tutorialToSuccess.textContent).to.contains(tutorial.title);
      expect(tutorialToLearnMore.textContent).to.contains(learningMoreTutorial.title);

      expect(find('.feedback-panel')).to.exist;
    });
  });
});
