import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail, authenticateByUsername } from '../helpers/authentication';
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
    module('Accessing to the default page page while disconnected', function () {
      test('should redirect to the connexion page', async function (assert) {
        // when
        await visit('/');

        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('Log-in phase', function () {
      test('should redirect to /accueil after connexion', async function (assert) {
        // when
        await authenticateByEmail(user);

        // then
        assert.strictEqual(currentURL(), '/accueil');
      });
    });
  });

  module('Error case', function () {
    test('should stay in /connexion, when authentication failed', async function (assert) {
      // given
      const screen = await visit('/connexion');
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'anyone@pix.world');
      await fillIn(screen.getByLabelText('Mot de passe'), 'Pix20!!');

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.sign-in.actions.submit') }));

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    module('when user should change password', function () {
      test('should redirect to /update-expired-password', async function (assert) {
        // given
        user = server.create('user', 'withUsername', 'shouldChangePassword');

        // when
        await authenticateByUsername(user);

        // then
        assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');
      });
    });
  });
});
