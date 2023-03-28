import { find, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Download an attachment from a challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let challengeWithAttachment;
  let assessment;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    challengeWithAttachment = server.create('challenge', 'forCompetenceEvaluation', 'withAttachment');
    server.create('challenge', 'forCompetenceEvaluation');
  });

  module('When the challenge has an attachment', function (hooks) {
    hooks.beforeEach(async function () {
      await visit(`/assessments/${assessment.id}/challenges/0`);
    });

    test('should have a way to download the attachment', function (assert) {
      assert.dom('.challenge-statement__action-link').exists();
    });

    test('should expose the correct attachment link', function (assert) {
      assert.ok(find('.challenge-statement__action-link').textContent.includes('Télécharger'));
      assert.strictEqual(challengeWithAttachment.attachments.length, 1);
      assert.strictEqual(
        find('.challenge-statement__action-link').getAttribute('href'),
        challengeWithAttachment.attachments[0]
      );
    });

    test('should only have one file downloadable', function (assert) {
      assert.dom('.challenge-statement__action-link').exists();
    });
  });

  module('When the challenge does not contain an attachment', function (hooks) {
    hooks.beforeEach(async function () {
      await visit(`/assessments/${assessment.id}/challenges/0`);
      await click('.challenge-actions__action-skip-text');
    });

    test('should hide the download section for the attachment', function (assert) {
      // We are in a challenge...
      assert.dom('.challenge-item').exists();

      // ... but attachment is hidden
      assert.dom('.challenge-statement__action-link').doesNotExist();
    });
  });
});
