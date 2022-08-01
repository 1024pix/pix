import { click, find, findAll, currentURL, fillIn, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Displaying a QROC challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let qrocChallenge;

  module('with input format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    });

    module('When challenge is an auto validated embed (autoReply=true)', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply', 'withEmbed');
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply', 'withEmbed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-skip-text');
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.dom(find('.challenge-response__proposal')).doesNotExist();
      });

      test('should display the alert box when user validates without successfully finishing the embed', async function (assert) {
        // when
        assert.dom(find('.challenge-response__alert')).doesNotExist();
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom(find('.challenge-response__alert')).exists();
        assert.equal(
          find('.challenge-response__alert').textContent.trim(),
          '“Vous pouvez valider” s‘affiche quand l‘épreuve est réussie. Essayez encore ou passez.'
        );
      });

      test('should go to the next challenge when user validates after finishing successfully the embed', async function (assert) {
        // when
        const event = document.createEvent('Event');
        event.initEvent('message', true, true);
        event.data = 'custom answer from embed';
        event.origin = 'https://epreuves.pix.fr';
        find('.embed__iframe').dispatchEvent(event);

        // then
        await click('.challenge-actions__action-validate');
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/challenges/2`);
      });
    });

    module('When challenge is an embed (without autoreply)', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withEmbed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-skip-text');
      });

      test('should display the alert box when user validates without successfully answering', async function (assert) {
        // when
        const event = document.createEvent('Event');
        event.initEvent('message', true, true);
        event.data = 'custom answer from embed';
        event.origin = 'https://epreuves.pix.fr';
        find('.embed__iframe').dispatchEvent(event);

        // then
        await click('.challenge-actions__action-validate');
        assert.equal(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir le champ texte. Sinon, passez.'
        );
      });
    });

    module('When challenge is not already answered', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocChallenge.instruction);

        assert.equal(findAll('.challenge-response__proposal').length, 1);
        assert.false(find('.challenge-response__proposal').disabled);

        assert.dom(findAll('.qroc_input-label')[0].innerHTML).hasText('Entrez le <em>prénom</em> de B. Gates :');

        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should display the alert box if user validates without write an answer in input', async function (assert) {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', '');
        assert.dom(find('.challenge-response__alert')).doesNotExist();
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom(find('.challenge-response__alert')).exists();
        assert.equal(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir le champ texte. Sinon, passez.'
        );
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('input', 'keyup');
        await fillIn('input[data-uid="qroc-proposal-uid"]', 'Test');

        // then
        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', 'Test');
        await click('.challenge-actions__action-validate');

        // then
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/checkpoint`);
      });
    });

    module('When challenge is already answered', function (hooks) {
      hooks.beforeEach(async function () {
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

      test('should set the input value with the current answer and propose to continue', async function (assert) {
        // then
        assert.equal(find('.challenge-response__proposal').value, 'Reponse');
        assert.true(find('.challenge-response__proposal').disabled);

        assert.dom(find('.challenge-actions__action-continue')).exists();
        assert.dom(find('.challenge-actions__action-validate')).doesNotExist();
        assert.dom(find('.challenge-actions__action-skip-text')).doesNotExist();
      });
    });

    module('When challenge is already answered and user wants to see answers', function (hooks) {
      let correction, tutorial, learningMoreTutorial;
      hooks.beforeEach(async function () {
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

      test('should show the result of previous challenge in checkpoint', async function (assert) {
        // then
        assert.equal(find('.result-item__icon').title, 'Réponse incorrecte');
        assert.equal(find('.result-item__instruction').textContent.trim(), qrocChallenge.instruction);
        assert.equal(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
      });

      test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
        // when
        await click('.result-item__correction-button');

        // then
        assert.equal(find('.comparison-window-header__title').textContent.trim(), 'Vous n’avez pas la bonne réponse');
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocChallenge.instruction);

        const goodAnswer = find('.comparison-window-solution__text');
        const badAnswerFromUserResult = find('.correction-qroc-box-answer');
        assert.equal(goodAnswer.textContent.trim(), 'Mangue');
        assert.dom(badAnswerFromUserResult.className).hasText('correction-qroc-box-answer--wrong');
        assert.equal(badAnswerFromUserResult.value, 'Banane');

        assert.dom(find('.tutorial-panel__hint-container').textContent).hasText(correction.hint);

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card-v2')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card-v2')[0];

        assert.dom(tutorialToSuccess.textContent).hasText(tutorial.title);
        assert.dom(tutorialToLearnMore.textContent).hasText(learningMoreTutorial.title);

        assert.dom(find('.feedback-panel')).exists();
      });
    });

    module('When there is two challenges with download file', function (hooks) {
      let qrocWithFile1Challenge, qrocWithFile2Challenge;

      hooks.beforeEach(async function () {
        qrocWithFile1Challenge = server.create('challenge', 'forDemo', 'QROCwithFile1');
        qrocWithFile2Challenge = server.create('challenge', 'forDemo', 'QROCwithFile2');
        assessment = server.create('assessment', 'ofDemoType');

        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should display the correct challenge for first one', async function (assert) {
        assert.equal(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocWithFile1Challenge.instruction
        );
        assert.dom(find('.challenge-statement__action-link').href).hasText(qrocWithFile1Challenge.attachments[0]);

        await click(find('#attachment1'));
        assert.dom(find('.challenge-statement__action-link').href).hasText(qrocWithFile1Challenge.attachments[1]);
      });

      test('should display the error alert if the users tries to validate an empty answer', async function (assert) {
        await click(find('.challenge-actions__action-skip'));

        assert.equal(currentURL(), `/assessments/${assessment.id}/challenges/1`);
        assert.equal(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocWithFile2Challenge.instruction
        );
        assert.dom(find('.challenge-statement__action-link').href).hasText(qrocWithFile2Challenge.attachments[0]);

        await click(find('#attachment1'));
        assert.dom(find('.challenge-statement__action-link').href).hasText(qrocWithFile2Challenge.attachments[1]);
      });
    });
  });

  module('with text-area format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withTextArea');
    });

    module('When challenge is not already answered', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocChallenge.instruction);

        assert.equal(findAll('.challenge-response__proposal').length, 1);
        assert.false(find('.challenge-response__proposal').disabled);
        assert.dom(findAll('.qroc_input-label')[0].innerHTML).hasText('Entrez le <em>prénom</em> de B. Gates :');

        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should display the alert box if user validates without write an answer in input', async function (assert) {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', '');
        assert.dom(find('.challenge-response__alert')).doesNotExist();
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom(find('.challenge-response__alert')).exists();
        assert.equal(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir le champ texte. Sinon, passez.'
        );
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('textarea', 'keyup');
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'Test');

        // then
        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'Test');
        await click('.challenge-actions__action-validate');

        // then
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/checkpoint`);
      });
    });

    module('When challenge is already answered and user wants to see answers', function (hooks) {
      let correction, tutorial, learningMoreTutorial;
      hooks.beforeEach(async function () {
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

      test('should show the result of previous challenge in checkpoint', async function (assert) {
        // then
        assert.equal(find('.result-item__icon').title, 'Réponse incorrecte');
        assert.equal(find('.result-item__instruction').textContent.trim(), qrocChallenge.instruction);
        assert.equal(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
      });

      test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
        // when
        await click('.result-item__correction-button');

        // then
        assert.equal(find('.comparison-window-header__title').textContent.trim(), 'Vous n’avez pas la bonne réponse');
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocChallenge.instruction);

        const goodAnswer = find('.comparison-window-solution__text');
        const badAnswerFromUserResult = find('.correction-qroc-box-answer');
        assert.equal(goodAnswer.textContent.trim(), 'Mangue');
        assert.dom(badAnswerFromUserResult.className).hasText('correction-qroc-box-answer--wrong');
        assert.equal(badAnswerFromUserResult.value, 'Banane');

        assert.dom(find('.tutorial-panel__hint-container').textContent).hasText(correction.hint);

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card-v2')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card-v2')[0];

        assert.dom(tutorialToSuccess.textContent).hasText(tutorial.title);
        assert.dom(tutorialToLearnMore.textContent).hasText(learningMoreTutorial.title);

        assert.dom(find('.feedback-panel')).exists();
      });
    });
  });

  module('with select format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCWithSelect');
    });

    module('When challenge is not already answered', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocChallenge.instruction);
        assert.equal(findAll('.challenge-response__proposal'), 1);
        assert.false(find('[data-test="challenge-response-proposal-selector"]').disabled);
        assert.dom(findAll('.qroc_input-label')[0].innerHTML).hasText('Select: ');

        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        await click('.challenge-actions__action-validate');
        assert.dom(find('.challenge-response__alert')).exists();
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[1];

        // when
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);

        // then
        assert.dom(find('.challenge-response__alert')).doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        const selectOptions = findAll('select[data-test="challenge-response-proposal-selector"] option');
        const optionToFillIn = selectOptions[1];
        await fillIn('select[data-test="challenge-response-proposal-selector"]', optionToFillIn.value);

        await click('.challenge-actions__action-validate');

        // then
        assert.dom(currentURL()).hasText(`/assessments/${assessment.id}/checkpoint`);
      });
    });

    module('When challenge is already answered and user wants to see answers', function (hooks) {
      let correction, tutorial, learningMoreTutorial;
      hooks.beforeEach(async function () {
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

      test('should show the result of previous challenge in checkpoint', async function (assert) {
        // then
        assert.equal(find('.result-item__icon').title, 'Réponse incorrecte');
        assert.equal(find('.result-item__instruction').textContent.trim(), qrocChallenge.instruction);
        assert.equal(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
      });

      test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
        // when
        await click('.result-item__correction-button');

        // then
        assert.equal(find('.comparison-window-header__title').textContent.trim(), 'Vous n’avez pas la bonne réponse');
        assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), qrocChallenge.instruction);

        const goodAnswer = find('.comparison-window-solution__text');
        const badAnswerFromUserResult = find('.correction-qroc-box-answer');
        assert.equal(goodAnswer.textContent.trim(), 'Mangue');
        assert.dom(badAnswerFromUserResult.className).hasText('correction-qroc-box-answer--wrong');
        assert.equal(badAnswerFromUserResult.value, 'Banane');

        assert.dom(find('.tutorial-panel__hint-container').textContent).hasText(correction.hint);

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card-v2')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card-v2')[0];

        assert.dom(tutorialToSuccess.textContent).hasText(tutorial.title);
        assert.dom(tutorialToLearnMore.textContent).hasText(learningMoreTutorial.title);

        assert.dom(find('.feedback-panel')).exists();
      });
    });
  });
});
