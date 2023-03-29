import { click, find, findAll, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Displaying a QCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let qcmChallenge;

  hooks.beforeEach(async function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    qcmChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QCM');
  });

  module('When challenge is not already answered', function (hooks) {
    hooks.beforeEach(async function () {
      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should render challenge information and question', function (assert) {
      // then
      assert.strictEqual(find('.challenge-statement-instruction__text').textContent.trim(), qcmChallenge.instruction);

      assert.dom('input[type="checkbox"]').exists({ count: 4 });

      const proposalsText = findAll('.proposal-text');

      assert.strictEqual(proposalsText[0].innerHTML.trim(), '<p><em>possibilite</em> 1, et/ou</p>');
      assert.strictEqual(proposalsText[1].textContent.trim(), 'possibilite 2, et/ou');
      assert.strictEqual(
        proposalsText[1].innerHTML.trim(),
        '<p><a href="/test" rel="noopener noreferrer" target="_blank">possibilite 2</a>, et/ou</p>'
      );
      assert.strictEqual(proposalsText[2].textContent.trim(), ', et/ou');
      assert.strictEqual(
        proposalsText[2].innerHTML.trim(),
        '<p><img src="/images/pix-logo-blanc.svg" alt="possibilite 3">, et/ou</p>'
      );
      assert.strictEqual(proposalsText[3].textContent.trim(), 'possibilite 4');
      assert.dom('.challenge-response__alert').doesNotExist();
    });

    test('should display the alert box if user validates without checking a checkbox', async function (assert) {
      // when
      await click('.challenge-actions__action-validate');

      // then
      assert.dom('.challenge-response__alert').exists();
      assert.strictEqual(
        find('.challenge-response__alert').textContent.trim(),
        'Pour valider, sélectionnez au moins une réponse. Sinon, passez.'
      );
    });

    test('should hide the alert error after the user interact with checkboxes', async function (assert) {
      // given
      await click('.challenge-actions__action-validate');

      // when
      await click(findAll('.proposal-text')[1]);

      // then
      assert.dom('.challenge-response__alert').doesNotExist();
    });

    test('should go to checkpoint when user validated', async function (assert) {
      // given
      await click(findAll('.proposal-text')[1]);

      // when
      await click('.challenge-actions__action-validate');

      // then
      assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
    });
  });

  module('When challenge is already answered', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      server.create('answer', {
        value: '2, 4',
        result: 'ko',
        assessment,
        challenge: qcmChallenge,
      });

      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should mark checkboxes corresponding to the answer and propose to continue', async function (assert) {
      // then
      assert.false(findAll('input[type="checkbox"]')[0].checked);
      assert.true(findAll('input[type="checkbox"]')[0].disabled);
      assert.true(findAll('input[type="checkbox"]')[1].checked);
      assert.true(findAll('input[type="checkbox"]')[1].disabled);
      assert.false(findAll('input[type="checkbox"]')[2].checked);
      assert.true(findAll('input[type="checkbox"]')[2].disabled);
      assert.true(findAll('input[type="checkbox"]')[3].checked);
      assert.true(findAll('input[type="checkbox"]')[3].disabled);

      assert.dom('.challenge-actions__action-continue').exists();
      assert.dom('.challenge-actions__action-validate').doesNotExist();
      assert.dom('.challenge-actions__action-skip-text').doesNotExist();
    });
  });

  module('When challenge is already answered and user wants to see answers', function (hooks) {
    let correction, tutorial, learningMoreTutorial;
    hooks.beforeEach(async function () {
      // given
      tutorial = server.create('tutorial');
      learningMoreTutorial = server.create('tutorial');
      correction = server.create('correction', {
        solution: '1',
        hint: 'Cliquer sur 1',
        tutorials: [tutorial],
        learningMoreTutorials: [learningMoreTutorial],
      });
      server.create('answer', {
        value: '2',
        result: 'ko',
        assessmentId: assessment.id,
        challengeId: qcmChallenge.id,
        correction,
      });

      // when
      await visit(`/assessments/${assessment.id}/checkpoint`);
    });

    test('should show the result of previous challenge in checkpoint', async function (assert) {
      // then

      assert.strictEqual(find('.result-item__icon').title, 'Réponse incorrecte');

      assert.strictEqual(find('.result-item__instruction').textContent.trim(), qcmChallenge.instruction);

      assert.strictEqual(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
    });

    test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click('.result-item__correction-button');

      // then
      assert.strictEqual(find('.challenge-statement-instruction__text').textContent.trim(), qcmChallenge.instruction);

      const goodAnswer = findAll('.qcm-proposal-label__answer-details')[0];
      const badAnswerFromUserResult = findAll('.qcm-proposal-label__answer-details')[1];

      assert.strictEqual(goodAnswer.getAttribute('data-goodness'), 'good');
      assert.strictEqual(goodAnswer.getAttribute('data-checked'), 'no');
      assert.strictEqual(badAnswerFromUserResult.getAttribute('data-goodness'), 'bad');
      assert.strictEqual(badAnswerFromUserResult.getAttribute('data-checked'), 'yes');
      assert.ok(find('.tutorial-panel__hint-container').textContent.includes(correction.hint));

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
      assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));

      assert.dom('.feedback-panel').exists();
    });
  });
});
