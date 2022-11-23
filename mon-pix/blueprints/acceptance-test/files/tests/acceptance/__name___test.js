import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';

module('Acceptance | <%= dasherizedModuleName %>', function (hooks) {
  setupApplicationTest(hooks);

  test('can visit /<%= dasherizedModuleName %>', async function (assert) {
    await visit('/<%= dasherizedModuleName %>');
    assert.strictEqual(currentURL(), '/<%= dasherizedModuleName %>');
  });
});
