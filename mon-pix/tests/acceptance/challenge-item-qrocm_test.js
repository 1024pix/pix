import { click, find, findAll, currentURL, fillIn, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';

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
        assert.strictEqual(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocmDepChallenge.instruction
        );

        assert.dom('.challenge-response__proposal').exists({ count: 2 });
        assert.false(findAll('.challenge-response__proposal')[0].disabled);
        assert.false(findAll('.challenge-response__proposal')[1].disabled);
        assert.ok(find('div[data-test="qrocm-label-0"]').innerHTML.includes('Station <strong>1</strong> :'));
        assert.ok(find('div[data-test="qrocm-label-1"]').innerHTML.includes('Station <em>2</em> :'));

        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should display the alert box if user validates without write an answer for each input', async function (assert) {
        // when
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], '');

        await click(find('.challenge-actions__action-validate'));

        assert.dom('.challenge-response__alert').exists();
        assert.strictEqual(
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
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        await fillIn(findAll('input')[0], 'ANSWER');
        await fillIn(findAll('input')[1], 'ANSWER');
        await click('.challenge-actions__action-validate');

        // then
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
      });
    });

    module('and challenge contains select field', function () {
      test('should not be able to validate with the initial option', async function (assert) {
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        await visitScreen(`/assessments/${assessment.id}/challenges/0`);

        // when
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom('.challenge-response__alert').exists();
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/challenges/0`));
      });

      test('should not be able to validate the empty option', async function (assert) {
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        const screen = await visitScreen(`/assessments/${assessment.id}/challenges/0`);

        // when
        await clickByName('saladAriaLabel');
        await screen.findByRole('listbox');
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom('.challenge-response__alert').exists();
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/challenges/0`));
      });

      test('should validate an option and redirect to next page', async function (assert) {
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        const screen = await visitScreen(`/assessments/${assessment.id}/challenges/0`);

        // when
        await clickByName('saladAriaLabel');
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'potato' }));
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
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
        assert.ok(find('div[data-test="qrocm-label-0"]').innerHTML.includes('Station <strong>1</strong> :'));
        assert.ok(find('div[data-test="qrocm-label-1"]').innerHTML.includes('Station <em>2</em> :'));
        assert.strictEqual(findAll('.challenge-response__proposal')[0].value, 'Republique');
        assert.true(findAll('.challenge-response__proposal')[0].disabled);
        assert.strictEqual(findAll('.challenge-response__proposal')[1].value, 'Chatelet');
        assert.true(findAll('.challenge-response__proposal')[1].disabled);

        assert.dom('.challenge-actions__action-continue').exists();
        assert.dom('.challenge-actions__action-validate').doesNotExist();
        assert.dom('.challenge-actions__action-skip-text').doesNotExist();
      });
    });

    module('and challenge contains select field', function () {
      test('should set the select with previous answer and propose to continue', async function (assert) {
        // given
        const qrocmWithSelectChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMWithSelect');
        server.create('answer', {
          value: "banana: 'mango'\n",
          result: 'ko',
          assessment,
          challenge: qrocmWithSelectChallenge,
        });

        // when
        const screen = await visitScreen(`/assessments/${assessment.id}/challenges/0`);

        // then
        assert.strictEqual(screen.getByLabelText('saladAriaLabel').innerText, 'mango');

        assert.dom('.challenge-actions__action-continue').exists();
        assert.dom('.challenge-actions__action-validate').doesNotExist();
        assert.dom('.challenge-actions__action-skip-text').doesNotExist();
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
      assert.strictEqual(findAll('.result-item__icon')[0].title, 'Réponse incorrecte');
      const instructionStripped = qrocmDepChallenge.instruction.slice(0, 102);
      assert.strictEqual(findAll('.result-item__instruction')[0].textContent.trim(), `${instructionStripped}...`);
      assert.strictEqual(findAll('.result-item__correction-button')[0].textContent.trim(), 'Réponses et tutos');
      assert.strictEqual(findAll('.result-item__icon')[1].title, 'Réponse incorrecte');
      const instructionStrippedInd = qrocmIndChallenge.instruction.slice(0, 104);
      assert.strictEqual(findAll('.result-item__instruction')[1].textContent.trim(), `${instructionStrippedInd}....`);
      assert.strictEqual(findAll('.result-item__correction-button')[1].textContent.trim(), 'Réponses et tutos');
      assert.strictEqual(findAll('.result-item__icon')[2].title, 'Réponse incorrecte');
      const instructionStrippedSelect = qrocmIndSelectChallenge.instruction.slice(0, 104);
      assert.strictEqual(
        findAll('.result-item__instruction')[2].textContent.trim(),
        `${instructionStrippedSelect}....`
      );
      assert.strictEqual(findAll('.result-item__correction-button')[2].textContent.trim(), 'Réponses et tutos');
    });

    test('should show details of QROCM-dep challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(findAll('.result-item__correction-button')[0]);

      // then
      assert.strictEqual(
        find('.challenge-statement-instruction__text').textContent.trim(),
        qrocmDepChallenge.instruction
      );

      const goodAnswers = find('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      assert.strictEqual(goodAnswers.textContent.trim(), 'Versailles-Chantiers et Poissy');
      assert.strictEqual(badAnswersFromUserResult[0].value, 'Republique');
      assert.strictEqual(badAnswersFromUserResult[1].value, 'Chatelet');

      assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correctionDep.hint));

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
      assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));

      assert.dom('.feedback-panel').exists();
    });

    test('should show details of QROCM-ind challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(findAll('.result-item__correction-button')[1]);

      // then
      assert.strictEqual(
        find('.challenge-statement-instruction__text').textContent.trim(),
        qrocmIndChallenge.instruction
      );

      const goodAnswers = findAll('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      assert.strictEqual(goodAnswers[0].textContent.trim(), 'Le petit prince');
      assert.strictEqual(goodAnswers[1].textContent.trim(), 'Saint-Exupéry');
      assert.strictEqual(badAnswersFromUserResult[0].value, 'Le rouge et le noir');
      assert.strictEqual(badAnswersFromUserResult[1].value, 'Stendhal');

      assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correctionDep.hint));

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
      assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));

      assert.dom('.feedback-panel').exists();
    });

    test('should show details of QROCM-ind challenge (with select) result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(findAll('.result-item__correction-button')[2]);

      // then
      assert.strictEqual(
        find('.challenge-statement-instruction__text').textContent.trim(),
        qrocmIndSelectChallenge.instruction
      );

      const goodAnswers = findAll('.correction-qrocm__solution-text');
      const badAnswersFromUserResult = findAll('.correction-qrocm__answer');

      assert.strictEqual(goodAnswers[0].textContent.trim(), 'mango');
      assert.strictEqual(badAnswersFromUserResult[0].value, 'potato');

      assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correctionIndSelect.hint));

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
      assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));

      assert.dom('.feedback-panel').exists();
    });
  });
});
