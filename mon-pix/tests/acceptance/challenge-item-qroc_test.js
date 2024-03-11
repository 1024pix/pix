import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, currentURL, fillIn, find, findAll, triggerEvent } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Displaying a QROC challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let qrocChallenge;

  module('with input format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = this.server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    });

    module('When challenge is an auto validated embed (autoReply=true)', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        this.server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply', 'withEmbed');
        this.server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withAutoReply', 'withEmbed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-skip-text');
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.dom('.challenge-response__proposal').doesNotExist();
      });

      test('should display the alert box when user validates without successfully finishing the embed', async function (assert) {
        // when
        assert.dom('.challenge-response__alert').doesNotExist();
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom('.challenge-response__alert[role="alert"]').exists();
        assert.strictEqual(
          find('.challenge-response__alert').textContent.trim(),
          '“Vous pouvez valider” s‘affiche quand l‘épreuve est réussie. Essayez encore ou passez.',
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
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/challenges/2`));
      });
    });

    module('When challenge is an embed (without autoreply)', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        this.server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withEmbed');

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
        assert.strictEqual(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir le champ texte. Sinon, passez.',
        );
      });
    });

    module('When challenge is not already answered', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // when
        screen = await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.ok(screen.getByText(qrocChallenge.instruction));
        assert.ok(screen.getByLabelText('Entrez le prénom de B. Gates :'));
        assert.ok(screen.getByPlaceholderText('prénom'));
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should display the alert box if user validates without write an answer in input', async function (assert) {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', '');
        assert.dom('.challenge-response__alert').doesNotExist();
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom('.challenge-response__alert[role="alert"]').exists();
        assert.strictEqual(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir le champ texte. Sinon, passez.',
        );
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('input', 'keyup');
        await fillIn('input[data-uid="qroc-proposal-uid"]', 'Test');

        // then
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        await fillIn('input[data-uid="qroc-proposal-uid"]', 'Test');
        await click('.challenge-actions__action-validate');

        // then
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
      });
    });

    module('When challenge is already answered', function (hooks) {
      hooks.beforeEach(async function () {
        // given
        this.server.create('answer', {
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
        assert.strictEqual(find('.challenge-response__proposal').value, 'Reponse');
        assert.dom('.challenge-actions__action-continue').exists();
        assert.dom('.challenge-actions__action-validate').doesNotExist();
        assert.dom('.challenge-actions__action-skip-text').doesNotExist();
      });
    });

    module('When challenge is already answered and user wants to see answers', function (hooks) {
      let correction, tutorial, learningMoreTutorial;
      hooks.beforeEach(async function () {
        // given
        tutorial = this.server.create('tutorial');
        learningMoreTutorial = this.server.create('tutorial');
        correction = this.server.create('correction', {
          solution: 'Mangue',
          hint: 'Manger des fruits',
          tutorials: [tutorial],
          learningMoreTutorials: [learningMoreTutorial],
        });
        this.server.create('answer', {
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
        assert.strictEqual(find('.result-item__icon').title, 'Réponse incorrecte');
        assert.strictEqual(find('.result-item__instruction').textContent.trim(), qrocChallenge.instruction);
        assert.strictEqual(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
      });

      test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
        // when
        await click('.result-item__correction-button');

        // then
        assert.strictEqual(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocChallenge.instruction,
        );

        const goodAnswer = find('.comparison-window-solution__text');
        const badAnswerFromUserResultContainer = find('.correction-qroc-box-answer');
        const badAnswerFromUserResultInput = find('.correction-qroc-box-answer--input');
        assert.strictEqual(goodAnswer.textContent.trim(), 'Mangue');
        assert.ok(badAnswerFromUserResultContainer.className.includes('correction-qroc-box-answer--wrong'));
        assert.strictEqual(badAnswerFromUserResultInput.value, 'Banane');
        assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correction.hint));

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

        assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
        assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));
        assert.dom('.feedback-panel').exists();
      });
    });

    module('When there is two challenges with download file', function (hooks) {
      let qrocWithFile1Challenge, qrocWithFile2Challenge;

      hooks.beforeEach(async function () {
        qrocWithFile1Challenge = this.server.create('challenge', 'forDemo', 'QROCwithFile1');
        qrocWithFile2Challenge = this.server.create('challenge', 'forDemo', 'QROCwithFile2');
        assessment = this.server.create('assessment', 'ofDemoType');

        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should display the correct challenge for first one', async function (assert) {
        assert.strictEqual(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocWithFile1Challenge.instruction,
        );
        assert.ok(find('.challenge-statement__action-link').href.includes(qrocWithFile1Challenge.attachments[0]));

        await click(find('#attachment1'));
        assert.ok(find('.challenge-statement__action-link').href.includes(qrocWithFile1Challenge.attachments[1]));
      });

      test('should display the error alert if the users tries to validate an empty answer', async function (assert) {
        await click(find('.challenge-actions__action-skip'));

        assert.strictEqual(currentURL(), `/assessments/${assessment.id}/challenges/1`);
        assert.strictEqual(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocWithFile2Challenge.instruction,
        );
        assert.ok(find('.challenge-statement__action-link').href.includes(qrocWithFile2Challenge.attachments[0]));

        await click(find('#attachment1'));
        assert.ok(find('.challenge-statement__action-link').href.includes(qrocWithFile2Challenge.attachments[1]));
      });
    });
  });

  module('with text-area format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = this.server.create('challenge', 'forCompetenceEvaluation', 'QROC', 'withTextArea');
    });

    module('When challenge is not already answered', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        // when
        screen = await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      test('should render challenge information and question', function (assert) {
        // then
        assert.ok(screen.getByText(qrocChallenge.instruction));
        assert.ok(screen.getByLabelText('Entrez le prénom de B. Gates :'));
        assert.ok(screen.getByPlaceholderText('prénom'));
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should display the alert box if user validates without write an answer in input', async function (assert) {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', '');
        assert.dom('.challenge-response__alert').doesNotExist();
        await click(find('.challenge-actions__action-validate'));

        // then
        assert.dom('.challenge-response__alert[role="alert"]').exists();
        assert.strictEqual(
          find('.challenge-response__alert').textContent.trim(),
          'Pour valider, veuillez remplir le champ texte. Sinon, passez.',
        );
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        await click('.challenge-actions__action-validate');

        // when
        await triggerEvent('textarea', 'keyup');
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'Test');

        // then
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // when
        await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'Test');
        await click('.challenge-actions__action-validate');

        // then
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
      });
    });

    module('When challenge is already answered and user wants to see answers', function (hooks) {
      let correction, tutorial, learningMoreTutorial;
      hooks.beforeEach(async function () {
        // given
        tutorial = this.server.create('tutorial');
        learningMoreTutorial = this.server.create('tutorial');
        correction = this.server.create('correction', {
          solution: 'Mangue',
          hint: 'Manger des fruits',
          tutorials: [tutorial],
          learningMoreTutorials: [learningMoreTutorial],
        });
        this.server.create('answer', {
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
        assert.strictEqual(find('.result-item__icon').title, 'Réponse incorrecte');
        assert.strictEqual(find('.result-item__instruction').textContent.trim(), qrocChallenge.instruction);
        assert.strictEqual(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
      });

      test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
        // when
        await click('.result-item__correction-button');

        // then
        assert.strictEqual(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocChallenge.instruction,
        );

        const goodAnswer = find('.comparison-window-solution__text');
        const badAnswerFromUserResultContainer = find('.correction-qroc-box-answer');
        const badAnswerFromUserResultInput = find('.correction-qroc-box-answer--paragraph');
        assert.strictEqual(goodAnswer.textContent.trim(), 'Mangue');
        assert.ok(badAnswerFromUserResultContainer.className.includes('correction-qroc-box-answer--wrong'));
        assert.strictEqual(badAnswerFromUserResultInput.value, 'Banane');
        assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correction.hint));

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

        assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
        assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));
        assert.dom('.feedback-panel').exists();
      });
    });
  });

  module('with select format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment', 'ofCompetenceEvaluationType');
      qrocChallenge = this.server.create('challenge', 'forCompetenceEvaluation', 'QROCWithSelect');
    });

    module('When challenge is not already answered', function () {
      test('should render challenge information and question', async function (assert) {
        // given
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        assert.ok(screen.getByText(qrocChallenge.instruction));
        assert.ok(screen.getByText(/Select:/, { exact: false, selector: 'label' }));
        assert.ok(screen.getByRole('button', { name: /Select:/ }));
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should allow selecting a value', async function (assert) {
        // given
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-validate');

        // when
        await click(screen.getByRole('button', { name: /Select:/ }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'mango' }));

        // then
        assert.dom('.pix-select-button').hasText('mango');
      });

      test('should hide the alert error after the user interact with input text', async function (assert) {
        // given
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);
        await click('.challenge-actions__action-validate');
        assert.dom('.challenge-response__alert[role="alert"]').exists();

        // when
        await click(screen.getByRole('button', { name: /Select:/ }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'mango' }));

        // then
        assert.dom('.challenge-response__alert').doesNotExist();
      });

      test('should go to checkpoint when user validated', async function (assert) {
        // given
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

        // when
        await click(screen.getByRole('button', { name: /Select:/ }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'mango' }));

        await click('.challenge-actions__action-validate');

        // then
        assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
      });
    });

    module('When challenge is already answered and user wants to see answers', function (hooks) {
      let correction, tutorial, learningMoreTutorial;
      hooks.beforeEach(async function () {
        // given
        tutorial = this.server.create('tutorial');
        learningMoreTutorial = this.server.create('tutorial');
        correction = this.server.create('correction', {
          solution: 'Mangue',
          hint: 'Manger des fruits',
          tutorials: [tutorial],
          learningMoreTutorials: [learningMoreTutorial],
        });
        this.server.create('answer', {
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
        assert.strictEqual(find('.result-item__icon').title, 'Réponse incorrecte');
        assert.strictEqual(find('.result-item__instruction').textContent.trim(), qrocChallenge.instruction);
        assert.strictEqual(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
      });

      test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
        // when
        await click('.result-item__correction-button');

        // then
        assert.strictEqual(
          find('.challenge-statement-instruction__text').textContent.trim(),
          qrocChallenge.instruction,
        );

        const goodAnswer = find('.comparison-window-solution__text');
        const badAnswerFromUserResultContainer = find('.correction-qroc-box-answer');
        const badAnswerFromUserResultInput = find('.correction-qroc-box-answer--input');

        assert.strictEqual(goodAnswer.textContent.trim(), 'Mangue');
        assert.ok(badAnswerFromUserResultContainer.className.includes('correction-qroc-box-answer--wrong'));
        assert.strictEqual(badAnswerFromUserResultInput.value, 'Banane');
        assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correction.hint));

        const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
        const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

        assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
        assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));

        assert.dom('.feedback-panel').exists();
      });
    });
  });
});
