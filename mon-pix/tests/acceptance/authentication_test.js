import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { fillIn, currentURL, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByEmail, authenticateByUsername } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Success cases', function () {
    module('Accessing to the default page page while disconnected', async function () {
      test('should redirect to the connexion page', async function (assert) {
        // when
        await visit('/');

        // then
        assert.equal(currentURL(), '/connexion');
      });
    });

    module('Log-in phase', function () {
      test('should redirect to /accueil after connexion', async function (assert) {
        // when
        await authenticateByEmail(user);

        // then
        assert.equal(currentURL(), '/accueil');
      });
    });
  });

  module('Error case', function () {
    test('should stay in /connexion, when authentication failed', async function (assert) {
      // given
      await visit('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

      // then
      assert.equal(currentURL(), '/connexion');
    });

    module('when user should change password', function () {
      test('should redirect to /update-expired-password', async function (assert) {
        // given
        user = server.create('user', 'withUsername', 'shouldChangePassword');

        // when
        await authenticateByUsername(user);

        // then
        assert.equal(currentURL(), '/mise-a-jour-mot-de-passe-expire');
      });
    });
  });
});
