import { click, find, findAll, currentURL, fillIn, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Displaying a QROCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let qrocmDepChallenge;

  hooks.beforeEach(async function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
  });

  module('When challenge is not already answered', function () {
    module('and challenge only has input fields', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        qrocmDepChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMDep');
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocmDepChallenge.instruction);

        assert.equal(findAll('.challenge-response__proposal'), 2);
        assert.false(findAll('.challenge-response__proposal')[0].disabled);
        assert.false(findAll('.challenge-response__proposal')[1].disabled);
        assert.dom(find('div[data-test="qrocm-label-0"]').innerHTML).hasText('Station <strong>1</strong> :');
        assert.dom(find('div[data-test="qrocm-label-1"]').innerHTML).hasText('Station <em>2</em> :');

        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should display the alert box if user validates without write an answer for each input', async function (assert) {
        // when
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], '');

        await click(find('.challenge-actions__action-validate'));

        assert.dom(find('.challenge-response__alert')).exists();
        assert.equal(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir tous les champs réponse. Sinon, passez.'
        );
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('input', 'keydown');
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], 'ANSWER');

        // then
        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], 'ANSWER');
        await click('.challenge-actions__action-validate');

        // then
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/checkpoint`);
      });
    });

    module('and challenge contains select field', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should not be able to validate with the initial option', async function (assert) {
        // when
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom(find('.challenge-response__alert')).exists();
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should not be able to validate the empty option', async function (assert) {
        // given
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[0];

        // when
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom(find('.challenge-response__alert')).exists();
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should validate an option and redirect to next page', async function (assert) {
        // given
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[1];

        // when
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/checkpoint`);
      });
    });
  });

  module('When challenge is already answered', function () {
    module('and challenge is only made of input fields', function (hooks) {
      hooks.beforeEach(async function () {
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

      test('should set the input text with previous answers and propose to continue', async function (assert) {
        // then
        assert.dom(find('div[data-test="qrocm-label-0"]').innerHTML).hasText('Station <strong>1</strong> :');
        assert.dom(find('div[data-test="qrocm-label-1"]').innerHTML).hasText('Station <em>2</em> :');
        assert.equal(findAll('.challenge-response__proposal')[0].value, 'Republique');
        assert.equal(findAll('.challenge-response__proposal')[1].value, 'Chatelet');

        findAll('.challenge-response__proposal').forEach((input) => assert.dom(input.disabled).to.equal(true));

        assert.dom(find('.challenge-actions__action-continue')).exists();
        assert.dom(find('.challenge-actions__action-validate')).doesNotExist();
        assert.dom(find('.challenge-actions__action-skip-text')).doesNotExist();
      });
    });

    module('and challenge contains select field', function (hooks) {
      hooks.beforeEach(async function () {
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

      test('should set the select with previous answer and propose to continue', async function (assert) {
        // then
        assert.dom(
          findAll('select[data-test="challenge-response-proposal-selector"] option')[1].hasAttribute('selected')
        );

        assert.dom(find('.challenge-actions__action-continue')).exists();
        assert.dom(find('.challenge-actions__action-validate')).doesNotExist();
        assert.dom(find('.challenge-actions__action-skip-text')).doesNotExist();
      });
    });
  });

  module('When challenge is already answered and user wants to see answers', function (hooks) {
    let correctionDep,
      correctionInd,
      tutorial,
      learningMoreTutorial,
      qrocmIndChallenge,
      qrocmIndSelectChallenge,
      correctionIndSelect;

    hooks.beforeEach(async function () {
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

    test('should show the result of previous challenges in checkpoint', async function (assert) {
      // then
      assert.equal(findAll('.result-item__icon')[0].title, 'Réponse incorrecte');
      const instructionStripped = qrocmDepChallenge.instruction.slice(0, 102);
      assert.equal(findAll('.result-item__instruction')[0].textContent.trim(), `${instructionStripped}...`);
      assert.equal(findAll('.result-item__correction-button')[0].textContent.trim(), 'Réponses et tutos');

      assert.equal(findAll('.result-item__icon')[1].title, 'Réponse incorrecte');
      const instructionStrippedInd = qrocmIndChallenge.instruction.slice(0, 104);
      assert.equal(findAll('.result-item__instruction')[1].textContent.trim(), `${instructionStrippedInd}....`);
      assert.equal(findAll('.result-item__correction-button')[1].textContent.trim(), 'Réponses et tutos');

      assert.equal(findAll('.result-item__icon')[2].title, 'Réponse incorrecte');
      const instructionStrippedSelect = qrocmIndSelectChallenge.instruction.slice(0, 104);
      assert.equal(findAll('.result-item__instruction')[2].textContent.trim(), `${instructionStrippedSelect}....`);
      assert.equal(findAll('.result-item__correction-button')[2].textContent.trim(), 'Réponses et tutos');
    });

    test('should show details of QROCM-dep challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(findAll('.result-item__correction-button')[0]);

      // then
      assert.equal(find('.comparison-window-header__title').textContent.trim(), 'Vous n’avez pas la bonne réponse');
      assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocmDepChallenge.instruction);

      const goodAnswers = find('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      assert.equal(goodAnswers.textContent.trim(), 'Versailles-Chantiers et Poissy');
      assert.equal(badAnswersFromUserResult[0].value, 'Republique');
      assert.equal(badAnswersFromUserResult[1].value, 'Chatelet');

      assert.dom(find('.tutorial-panel__hint-container').textContent).hasText(correctionDep.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card-v2')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card-v2')[0];

      assert.dom(tutorialToSuccess.textContent).hasText(tutorial.title);
      assert.dom(tutorialToLearnMore.textContent).hasText(learningMoreTutorial.title);

      assert.dom(find('.feedback-panel')).exists();
    });

    test('should show details of QROCM-ind challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(findAll('.result-item__correction-button')[1]);

      // then
      assert.equal(find('.comparison-window-header__title').textContent.trim(), 'Vous n’avez pas la bonne réponse');
      assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocmIndChallenge.instruction);

      const goodAnswers = findAll('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      assert.equal(goodAnswers[0].textContent.trim(), 'Le petit prince');
      assert.equal(goodAnswers[1].textContent.trim(), 'Saint-Exupéry');
      assert.equal(badAnswersFromUserResult[0].value, 'Le rouge et le noir');
      assert.equal(badAnswersFromUserResult[1].value, 'Stendhal');

      assert.dom(find('.tutorial-panel__hint-container').textContent).hasText(correctionDep.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card-v2')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card-v2')[0];

      assert.dom(tutorialToSuccess.textContent).hasText(tutorial.title);
      assert.dom(tutorialToLearnMore.textContent).hasText(learningMoreTutorial.title);

      assert.dom(find('.feedback-panel')).exists();
    });

    test('should show details of QROCM-ind challenge (with select) result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(findAll('.result-item__correction-button')[2]);

      // then
      assert.equal(find('.comparison-window-header__title').textContent.trim(), 'Vous n’avez pas la bonne réponse');
      assert.equal(
        find('.challenge-statement-instruction__text').textContent.trim(),
        qrocmIndSelectChallenge.instruction
      );

      const goodAnswers = findAll('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      assert.equal(goodAnswers[0].textContent.trim(), 'mango');
      assert.equal(badAnswersFromUserResult[0].value, 'potato');

      assert.dom(find('.tutorial-panel__hint-container').textContent).hasText(correctionIndSelect.hint);

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card-v2')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card-v2')[0];

      assert.dom(tutorialToSuccess.textContent).hasText(tutorial.title);
      assert.dom(tutorialToLearnMore.textContent).hasText(learningMoreTutorial.title);

      assert.dom(find('.feedback-panel')).exists();
    });
  });
});
