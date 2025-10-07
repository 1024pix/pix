import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';
import { unabortedVisit } from '../../helpers/unaborted-visit';

module('Acceptance | OIDC | authentication flow', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function () {
    sinon.stub(Location, 'assign');
  });

  hooks.afterEach(function () {
    Location.assign.restore();
  });

  module('when the user has not performed an authentication to the OIDC Provider', function () {
    module('when the wanted OIDC Provider is not enabled/ready/existing', function () {
      test('it redirects the user to the login page', async function (assert) {
        // when
        await unabortedVisit('/connexion/some-oidc-provider-not-enabled-ready-existing');

        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('when the wanted OIDC Provider is enabled and ready', function () {
      test('it redirects the user to the OIDC provider authentication page', async function (assert) {
        // when
        await unabortedVisit('/connexion/oidc-partner');

        // then
        assert.ok(Location.assign.calledWith('https://oidc/connexion/oauth2/authorize'));
      });
    });
  });

  module('when the user has performed an authentication to the OIDC Provider', function () {
    module('when the wanted OIDC Provider is not enabled/ready/existing', function () {
      test('it redirects the user to the login page', async function (assert) {
        // when
        await unabortedVisit('/connexion/some-oidc-provider-not-enabled-ready-existing?code=code&state=state');

        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('when the wanted OIDC Provider is enabled and ready', function () {
      test('it redirects the user to the oidc-signup-or-login page', async function (assert) {
        // when
        await unabortedVisit('/connexion/oidc-partner?code=code&state=state');

        // then
        assert.strictEqual(currentURL(), '/connexion/oidc?identityProviderSlug=oidc-partner');
      });

      module('when the user has a Pix account', function () {
        test('the user can log in their account', async function (assert) {
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
            screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
            'lloyd.ce@example.net',
          );
          await fillIn(screen.getByLabelText(t('pages.oidc-signup-or-login.login-form.password')), 'pix123');
          await click(screen.getByRole('button', { name: 'Je me connecte' }));
          // eslint-disable-next-line ember/no-settled-after-test-helper
          await settled();

          // then
          assert.ok(
            screen.getByRole('heading', {
              name: "Attention ! Un nouveau moyen de connexion est sur le point d'être ajouté à votre compte Pix",
            }),
          );
        });
      });

      module('when the user creates an account', function () {
        module('when the user logs out', function () {
          test('it redirects the user to the logout URL', async function (assert) {
            // given
            const screen = await visit('/connexion/oidc-partner?code=code&state=state');
            await click(screen.getByLabelText(t('common.cgu.label')));
            await click(screen.getByRole('button', { name: 'Je crée mon compte' }));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            await click(screen.getByRole('button', { name: 'Lloyd Consulter mes informations' }));

            // when
            await click(screen.getByRole('link', { name: 'Se déconnecter' }));

            // then
            assert.strictEqual(currentURL(), '/deconnexion');
          });
        });
      });
    });
  });
});
