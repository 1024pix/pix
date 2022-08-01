import { currentURL, find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Course ending screen', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;
  let firstChallenge;
  let secondChallenge;

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
    await visit(`/assessments/${assessment.id}/results`);
  });

  test('should be available directly from the url', function (assert) {
    assert.equal(currentURL(), `/assessments/${assessment.id}/results`);
  });

  test('should display a summary of all the answers', function (assert) {
    assert.dom(find('.assessment-results__list')).exists();
  });

  test('should display the matching instructions', function (assert) {
    assert.dom(findAll('.result-item')[0].textContent.trim()).hasText(firstChallenge.instruction);
    assert.dom(findAll('.result-item')[1].textContent.trim()).hasText(secondChallenge.instruction);
  });

  test('should display the course name', function (assert) {
    assert.dom(find('.assessment-banner__title').textContent).hasText(assessment.title);
  });

  test('should not display the back button to return to the home page', function (assert) {
    assert.dom(find('.assessment-banner__home-link')).doesNotExist();
  });

  test('should display a way to come back to the test list', function (assert) {
    assert.dom(find('.assessment-results__index-link-container')).exists();
  });

  test('should display the course banner', function (assert) {
    assert.dom(find('.assessment-results__assessment-banner')).exists();
  });

  test('should display a button that redirects to inscription page', async function (assert) {
    assert.dom(find('.assessment-results__index-link__element')).exists();
    assert.equal(find('.assessment-results__index-a-link').attributes.href.value, 'https://app.pix.fr/inscription');
    assert.dom(find('.assessment-results__link-back').textContent).hasText('Continuer mon expérience Pix');
  });
});
