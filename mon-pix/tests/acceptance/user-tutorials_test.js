import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, currentURL } from '@ember/test-helpers';
import { authenticate } from '../helpers/authentication';

module('Acceptance | mes-tutos', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  module('When the new tutorials page is disabled', function (hooks) {
    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
      await authenticate(user);
    });

    test('user is redirected to /mes-tutos/recommandes when visiting /mes-tutos', async function (assert) {
      // given & when
      await visit('/mes-tutos');

      // then
      assert.strictEqual(currentURL(), '/mes-tutos/recommandes');
    });

    test('user is redirected to /mes-tutos/enregistres when visiting /mes-tutos/enregistres', async function (assert) {
      // given & when
      await visit('/mes-tutos/enregistres');

      // then
      assert.strictEqual(currentURL(), '/mes-tutos/enregistres');
    });
  });
});
