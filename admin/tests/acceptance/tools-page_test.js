import { module, test } from 'qunit';
import { currentURL, visit, click, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | tools page', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
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
      assert.dom('button').exists();
    });
  });

  module('Refresh cache content', function() {

    test('it request the cache refresh', async function(assert) {
      await visit('/tools');
      await click(findAll('section button')[0]);
      assert.contains('La demande de rechargement du cache a bien été prise en compte.');
    });
  });

  module('Create release and refresh cache content', function() {

    test('it request the release creation and refresh cache', async function(assert) {
      await visit('/tools');
      await click(findAll('section button')[1]);
      assert.contains('La création de la version du référentiel et le rechargement du cache a bien été prise en compte.');
    });
  });

});
