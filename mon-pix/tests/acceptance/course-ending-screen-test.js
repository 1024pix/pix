import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { currentURL, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Course ending screen', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let firstChallenge;
  let secondChallenge;
  let screen;

  hooks.beforeEach(async function () {
    assessment = server.create('assessment', 'ofDemoType');
    firstChallenge = server.create('challenge', 'forDemo', 'QCU');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge: firstChallenge,
      assessment,
    });
    secondChallenge = server.create('challenge', 'forDemo', 'QCM');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge: secondChallenge,
      assessment,
    });
    screen = await visit(`/assessments/${assessment.id}/results`);
  });

  test('should be available directly from the url', function (assert) {
    assert.strictEqual(currentURL(), `/assessments/${assessment.id}/results`);
  });

  test('should display a summary of all the answers', function (assert) {
    assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 2);
  });

  test('should display the matching instructions', function (assert) {
    assert.dom(screen.getByText(firstChallenge.instruction)).exists();
    assert.dom(screen.getByText(secondChallenge.instruction)).exists();
  });

  test('should display the course name', function (assert) {
    assert.ok(find('.assessment-banner__title').textContent.includes(assessment.title));
  });

  test('should not display the back button to return to the home page', function (assert) {
    assert.dom(screen.queryByRole('button', { name: 'Quitter' })).doesNotExist();
  });

  test('should display a way to come back to the test list', function (assert) {
    assert.dom(screen.getByRole('link', { name: 'Continuer mon expérience Pix' })).exists();
  });

  test('should display the course banner', async function (assert) {
    assert.dom(screen.getByRole('heading', { name: "Épreuve pour l'évaluation : Assessment title" })).exists();
  });

  test('should display a button that redirects to inscription page', async function (assert) {
    assert
      .dom(screen.getByRole('link', { name: 'Continuer mon expérience Pix' }))
      .hasAttribute('href', 'https://app.pix.org/inscription');
  });
});
