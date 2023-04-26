import { click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Common behavior to all challenges', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;
  let answer;

  module('Challenge answered: the answers inputs should be disabled', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      user = server.create('user', 'withEmail');
      await authenticate(user);
      const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      const challenge = server.create('challenge', 'forCompetenceEvaluation');
      answer = server.create('answer', 'skipped', { assessment, challenge });
    });

    test('should display the lock overlay and disable input', async function (assert) {
      // when
      const screen = await visit(`/assessments/${answer.assessmentId}/challenges/0`);

      // then
      assert.true(screen.getByRole('textbox', { name: 'Rue de :' }).disabled);
    });

    test('should display the resume button and the information sentence', async function (assert) {
      // when
      const screen = await visit(`/assessments/${answer.assessmentId}/challenges/0`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Poursuivre' })).exists();
      assert.dom(screen.getByText('Vous avez déjà répondu à cette question')).exists();
    });
  });

  module('Challenge not answered', function (hooks) {
    let assessment;
    let challengeBis;

    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
      await authenticate(user);
      assessment = server.create('assessment', 'ofCompetenceEvaluationType', {
        title: 'Assessment title',
      });
      server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {
        instruction: 'Instruction [lien](http://www.a.link.example.url)',
      });
      challengeBis = server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {
        instruction: 'Second instruction',
      });
    });

    test('should display the name of the test', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert
        .dom(screen.getByRole('heading', { name: "Épreuve pour l'évaluation : Assessment title", level: 1 }))
        .exists();
    });

    test('should display the challenge to answered instead of challenge asked', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/${challengeBis.id}`);

      // then
      assert.dom(screen.getByText('Instruction')).exists();
    });

    test('should display the challenge instruction', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(screen.getByText('Instruction')).exists();
    });

    test('should format content written as [foo](bar) as clickable link', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert
        .dom(screen.getByRole('link', { name: 'lien (Ouverture dans une nouvelle fenêtre)' }))
        .hasAttribute('href', 'http://www.a.link.example.url');
    });

    test('should open links in a new tab', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert
        .dom(screen.getByRole('link', { name: 'lien (Ouverture dans une nouvelle fenêtre)' }))
        .hasAttribute('target', '_blank');
    });

    test('should display the skip button', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' })).exists();
    });

    test('should display the validate button', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' })).exists();
    });

    test('should display a button to come back to the courses list', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Quitter' })).exists();
    });

    test('should come back to the home route when the back button is clicked', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await screen.findByRole('dialog');

      // then
      assert
        .dom(screen.getByRole('link', { name: "Quitter l'épreuve et retourner à la page d'accueil" }))
        .hasAttribute('href', '/');
    });

    test('should be able to send a feedback about the current challenge', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Signaler un problème' })).exists();
    });
  });

  module('When user is anonymous', function () {
    test('should not display home link', async function (assert) {
      //given
      const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {
        instruction: 'Instruction [lien](http://www.a.link.example.url)',
      });
      const user = server.create('user', 'withEmail', {
        isAnonymous: true,
      });

      await authenticate(user);

      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Quitter' })).doesNotExist();
    });
  });
});
