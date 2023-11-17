import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import setupIntl from '../../helpers/setup-intl';
import { test, module } from 'qunit';

module('Acceptance | OIDC | authentication flow', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user is logged in to external provider', function () {
    module('when user logs out with logout url', function () {
      test('should redirect the user to logout url', async function (assert) {
        // given
        const screen = await visit('/connexion/oidc-partner?code=code&state=state');
        await click(screen.getByLabelText(this.intl.t('common.cgu.label')));
        await click(screen.getByRole('button', { name: 'Je crée mon compte' }));
        await click(screen.getByRole('button', { name: 'Lloyd Consulter mes informations' }));

        // when
        await click(screen.getByRole('link', { name: 'Se déconnecter' }));

        // then
        assert.strictEqual(currentURL(), '/deconnexion');
      });
    });

    module('when user have a pix account', function () {
      test('should redirect user to reconciliation page', async function (assert) {
        // given
        server.create('user', {
          email: 'lloyd.ce@example.net',
          password: 'pix123',
          cgu: true,
          mustValidateTermsOfService: false,
          lastTermsOfServiceValidatedAt: new Date(),
        });
        const screen = await visit('/connexion/oidc-partner?code=code&state=state');

        // when
        await fillIn(
          screen.getByRole('textbox', { name: this.intl.t('pages.login-or-register-oidc.login-form.email') }),
          'lloyd.ce@example.net',
        );
        await fillIn(screen.getByLabelText(this.intl.t('pages.login-or-register-oidc.login-form.password')), 'pix123');
        await click(screen.getByRole('button', { name: 'Je me connecte' }));

        // then
        assert.ok(
          screen.getByRole('heading', {
            name: "Attention ! Un nouveau moyen de connexion est sur le point d'être ajouté à votre compte Pix",
          }),
        );
      });
    });
  });
});
