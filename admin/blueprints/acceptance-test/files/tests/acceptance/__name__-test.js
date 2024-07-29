import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | <%= dasherizedModuleName %>', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /<%= dasherizedModuleName %>', async function(assert) {
    await visit('/<%= dasherizedModuleName %>');

    assert.strictEqual(currentURL(), '/<%= dasherizedModuleName %>');
  });
});
