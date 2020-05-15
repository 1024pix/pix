import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | tools page', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await createAuthenticateSession({ userId: 1 });
  });

  module('Access', function() {

    test('Tools page should be accessible from /tools', async function(assert) {
      // when
      await visit('/tools');

      // then
      assert.equal(currentURL(), '/tools');
    });
  });

  module('Rendering', function(hooks) {

    hooks.beforeEach(async function() {
      await visit('/tools');
    });

    test('Should content "Learning content" section', async function(assert) {
      assert.dom('section.learning-content').exists();
      assert.dom('button.btn-refresh-cache').exists();
    });
  });

});
