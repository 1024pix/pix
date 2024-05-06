import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

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
    let screen;
    hooks.beforeEach(async function () {
      // when
      screen = await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should render challenge information and question', async function (assert) {
      // then
      assert
        .dom(screen.queryByText("Un QCM propose plusieurs choix, l'utilisateur peut en choisir plusieurs"))
        .exists();

      assert.dom(screen.getByRole('checkbox', { name: 'possibilite 1, et/ou' })).exists();
      assert.dom(screen.getByRole('checkbox', { name: 'possibilite 2 , et/ou' })).exists();
      assert.dom(screen.getByRole('checkbox', { name: 'possibilite 3 , et/ou' })).exists();
      assert.dom(screen.getByRole('checkbox', { name: 'possibilite 4' })).exists();

      assert
        .dom(screen.queryByText('Pour valider, sélectionnez au moins deux réponses. Sinon, passez.'))
        .doesNotExist();
    });

    test('should display the alert box if user validates without checking a checkbox', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }));

      // then
      assert.dom(screen.getByText('Pour valider, sélectionnez au moins deux réponses. Sinon, passez.')).exists();
    });

    test('should display the alert box if user validates checking one checkbox', async function (assert) {
      // when
      await click(screen.getByRole('checkbox', { name: 'possibilite 1, et/ou' }));
      await click(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }));

      // then
      assert.dom(screen.getByText('Pour valider, sélectionnez au moins deux réponses. Sinon, passez.')).exists();
    });

    test('should hide the alert error after the user interact with checkboxes', async function (assert) {
      // given
      await click(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }));

      // when
      await click(screen.getByRole('checkbox', { name: 'possibilite 2 , et/ou' }));

      // then
      assert
        .dom(screen.queryByText('Pour valider, sélectionnez au moins deux réponses. Sinon, passez.'))
        .doesNotExist();
    });

    test('should go to checkpoint when user validated', async function (assert) {
      // given
      await click(screen.getByRole('checkbox', { name: 'possibilite 2 , et/ou' }));
      await click(screen.getByRole('checkbox', { name: 'possibilite 3 , et/ou' }));

      // when
      await click(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }));

      // then
      assert.ok(currentURL().includes(`/assessments/${assessment.id}/checkpoint`));
    });
  });

  module('When challenge is already answered', function (hooks) {
    let screen;
    hooks.beforeEach(async function () {
      // given
      server.create('answer', {
        value: '2, 4',
        result: 'ko',
        assessment,
        challenge: qcmChallenge,
      });

      // when
      screen = await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should mark checkboxes corresponding to the answer and propose to continue', async function (assert) {
      // then
      assert.false(screen.getByRole('checkbox', { name: 'possibilite 1, et/ou' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'possibilite 1, et/ou' }).disabled);
      assert.true(screen.getByRole('checkbox', { name: 'possibilite 2 , et/ou' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'possibilite 2 , et/ou' }).disabled);
      assert.false(screen.getByRole('checkbox', { name: 'possibilite 3 , et/ou' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'possibilite 3 , et/ou' }).disabled);
      assert.true(screen.getByRole('checkbox', { name: 'possibilite 4' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'possibilite 4' }).disabled);

      assert.dom(screen.getByRole('button', { name: 'Poursuivre' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Je valide et je vais à la prochaine question' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Je passe et je vais à la prochaine question' })).doesNotExist();
    });
  });

  module('When challenge is already answered and user wants to see answers', function (hooks) {
    let correction, tutorial, learningMoreTutorial, screen;
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
      screen = await visit(`/assessments/${assessment.id}/checkpoint`);
    });

    test('should show the result of previous challenge in checkpoint', async function (assert) {
      // then
      assert.dom(screen.getByTitle('Réponse incorrecte')).exists();

      assert.dom(screen.getByText("Un QCM propose plusieurs choix, l'utilisateur peut en choisir plusieurs")).exists();

      assert.dom(screen.getByRole('button', { name: 'Réponses et tutos' })).exists();
    });

    test('should show details of challenge result in pop-in, with tutorials and feedbacks', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Réponses et tutos' }));

      // then
      assert
        .dom(screen.getAllByText("Un QCM propose plusieurs choix, l'utilisateur peut en choisir plusieurs")[0])
        .exists();

      const goodAnswer = findAll('.qcm-proposal-label__answer-details')[0];
      const badAnswerFromUserResult = findAll('.qcm-proposal-label__answer-details')[1];

      assert.strictEqual(goodAnswer.getAttribute('data-goodness'), 'good');
      assert.strictEqual(goodAnswer.getAttribute('data-checked'), 'no');
      assert.strictEqual(badAnswerFromUserResult.getAttribute('data-goodness'), 'bad');
      assert.strictEqual(badAnswerFromUserResult.getAttribute('data-checked'), 'yes');

      assert.dom(screen.getByText('Cliquer sur 1')).exists();

      const tutorialToSuccess = findAll('.tutorial-panel__tutorials-container .tutorial-card')[0];
      const tutorialToLearnMore = findAll('.learning-more-panel__list-container .tutorial-card')[0];

      assert.ok(tutorialToSuccess.textContent.includes(tutorial.title));
      assert.ok(tutorialToLearnMore.textContent.includes(learningMoreTutorial.title));

      await screen.findByRole('dialog');
      assert.dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' })).exists();
    });
  });
});
