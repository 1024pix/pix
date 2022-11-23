import { find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Common behavior to all challenges', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  module('Challenge answered: the answers inputs should be disabled', function (hooks) {
    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
      const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      const challenge = server.create('challenge', 'forCompetenceEvaluation');
      const answer = server.create('answer', 'skipped', { assessment, challenge });

      await visit(`/assessments/${answer.assessmentId}/challenges/0`);
    });

    test('should display the lock overlay', function (assert) {
      assert.dom('.challenge-response--locked').exists();
    });

    test('should display the resume button and the information sentence', function (assert) {
      assert.dom('.challenge-actions__action-continue').exists();
      assert.dom('.challenge-actions__already-answered').exists();
    });
  });

  module('Challenge not answered', function (hooks) {
    let assessment;
    let challengeBis;

    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {
        instruction: 'Instruction [lien](http://www.a.link.example.url)',
      });
      challengeBis = server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {
        instruction: 'Second instruction',
      });
      await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should display the name of the test', async function (assert) {
      assert.ok(find('.assessment-banner__title').textContent.includes(assessment.title));
    });

    test('should display the challenge to answered instead of challenge asked', async function (assert) {
      await visit(`/assessments/${assessment.id}/challenges/${challengeBis.id}`);
      assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), 'Instruction lien');
    });

    test('should display the challenge instruction', function (assert) {
      assert.equal(find('.challenge-statement-instruction__text').textContent.trim(), 'Instruction lien');
    });

    test('should format content written as [foo](bar) as clickable link', function (assert) {
      assert.dom('.challenge-statement-instruction__text a').exists();
      assert.equal(find('.challenge-statement-instruction__text a').textContent, 'lien');
      assert.equal(
        find('.challenge-statement-instruction__text a').getAttribute('href'),
        'http://www.a.link.example.url'
      );
    });

    test('should open links in a new tab', function (assert) {
      assert.equal(find('.challenge-statement-instruction__text a').getAttribute('target'), '_blank');
    });

    test('should display the skip button', function (assert) {
      assert.dom('.challenge-actions__action-skip').exists();
    });

    test('should display the validate button', function (assert) {
      assert.dom('.challenge-actions__action-skip').exists();
    });

    test('should display a button to come back to the courses list', function (assert) {
      assert.dom('.assessment-banner__home-link').exists();
    });

    test('should come back to the home route when the back button is clicked', async function (assert) {
      assert.equal(find('.assessment-banner__home-link').getAttribute('href'), '/');
    });

    test('should be able to send a feedback about the current challenge', function (assert) {
      assert.dom('.feedback-panel').exists();
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

      await authenticateByEmail(user);

      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom('.assessment-banner__home-link').doesNotExist();
    });
  });
});
