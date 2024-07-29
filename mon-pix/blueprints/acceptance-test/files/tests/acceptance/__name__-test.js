import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | <%= dasherizedModuleName %>', function (hooks) {
  setupApplicationTest(hooks);

  test('can visit /<%= dasherizedModuleName %>', async function (assert) {
    await visit('/<%= dasherizedModuleName %>');
    assert.strictEqual(currentURL(), '/<%= dasherizedModuleName %>');
  });
});
