import { find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Page | Inscription', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('should contain a link to "Terms of service" page', async function (assert) {
    await visit('/inscription');

    assert.dom(find('.signup-form__cgu-label .link')).exists();
  });
});
