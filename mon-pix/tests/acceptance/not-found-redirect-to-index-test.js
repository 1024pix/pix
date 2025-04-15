import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

module('Acceptance | Page | Not Found Redirection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should redirect to home page when URL is a nonexistant page', async function (assert) {
    await visit('/plop');

    assert.strictEqual(currentURL(), '/connexion');
  });
});
