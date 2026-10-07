import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, settled } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import Location from 'pix-orga/utils/location';
import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';
import {
  createPrescriberByUser,
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../../helpers/test-init';

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
        await visit('/connexion/some-oidc-provider-not-enabled-ready-existing');

        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('when the wanted OIDC Provider is enabled and ready', function () {
      test('it redirects the user to the OIDC provider authentication page', async function (assert) {
        // when
        await visit('/connexion/oidc-partner');

        // then
        assert.ok(Location.assign.calledWith('https://oidc/connexion/oauth2/authorize'));
      });
    });
  });

  module('when the user has performed an authentication to the OIDC Provider', function () {
    module('when the wanted OIDC Provider is not enabled/ready/existing', function () {
      test('it redirects the user to the login page', async function (assert) {
        // when
        await visit('/connexion/some-oidc-provider-not-enabled-ready-existing?code=code&state=state');

        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('when the wanted OIDC Provider is enabled and ready', function (hooks) {
      const invitationStorage = new SessionStorageEntry('joinInvitationData');
      let invitation;

      hooks.beforeEach(() => {
        invitation = server.create('organizationInvitation', {
          status: 'pending',
          code: 'ABCD',
          organizationName: 'College BRO & Evil Associates',
        });

        invitationStorage.set({
          invitationId: String(invitation.id),
          code: invitation.code,
          organizationName: invitation.organizationName,
        });
      });

      hooks.afterEach(function () {
        invitationStorage.remove();
      });

      module('when the user is invited', function () {
        test('the user is redirected to the Pix signup form', async function (assert) {
          // when
          await visit('/connexion/oidc-partner?code=code&state=state');

          // then
          assert.strictEqual(currentURL(), '/connexion/oidc-partner/signup');
        });
      });

      module('when the user is not invited', function () {
        test('the user is redirected to the Pix login form', async function (assert) {
          // when
          invitationStorage.remove();
          await visit('/connexion/oidc-partner?code=code&state=state');

          // then
          assert.strictEqual(currentURL(), '/connexion/oidc-partner/login');
        });
      });

      module('when the user submits Pix login form', function () {
        module('when the Pix account exists and the password is correct', function () {
          test('the user is redirected to the confirmation page', async function (assert) {
            // given
            const user = server.create('user', {
              email: 'lloyd.ce@example.net',
            });

            const screen = await visit('/connexion/oidc-partner?code=code&state=state');
            await click(await screen.getByRole('link', { name: t('pages.oidc.signup.login-button') }));

            // when
            await fillIn(await screen.getByRole('textbox', { name: t('pages.login-form.email.label') }), user.email);
            await fillIn(await screen.getByLabelText(t('pages.login-form.password')), 'pix123');
            const loginButton = screen.getByRole('button', { name: t('pages.login-form.associate-account') });
            await click(loginButton);

            // then
            assert.ok(
              await screen.findByRole('heading', {
                name: `${t('components.authentication.oidc-association-confirmation.title')}`,
              }),
            );
            assert.ok(await screen.findByText(t('components.authentication.oidc-association-confirmation.email')));
            assert.ok(await screen.findByText('lloyd.ce@example.net'));
            assert.ok(
              await screen.findByText(
                t('components.authentication.oidc-association-confirmation.authentication-method-to-add'),
              ),
            );
            assert.ok(
              await screen.findByText(
                `${t('components.authentication.oidc-association-confirmation.external-connection-via')} Partenaire OIDC`,
              ),
            );
            assert.ok(await screen.findByText('LLoyd Idp'));
            assert.strictEqual(currentURL(), '/connexion/oidc-partner/confirm');
          });
        });

        module('when the Pix account does not exist or the password is incorrect', function () {
          test('the login form displays a missing or invalid credentials error message', async function (assert) {
            // given
            this.server.post(
              '/oidc/user/check-reconciliation',
              {
                errors: [
                  {
                    status: '401',
                    code: 'MISSING_OR_INVALID_CREDENTIALS',
                    title: 'Unauthorized',
                    detail: 'Missing or invalid credentials',
                    meta: { isLoginFailureWithUsername: false },
                  },
                ],
              },
              401,
            );
            const screen = await visit('/connexion/oidc-partner?code=code&state=state');
            await click(await screen.getByRole('link', { name: t('pages.oidc.signup.login-button') }));

            // when
            await fillIn(
              screen.getByRole('textbox', { name: t('pages.login-form.email.label') }),
              'no-account-with-this-email@example.net',
            );
            await fillIn(screen.getByLabelText(t('pages.login-form.password')), 'incorrect-password');

            await click(screen.getByRole('button', { name: t('pages.login-form.associate-account') }));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            // then
            assert.ok(screen.getByText(t('common.api-error-messages.login-unauthorized-error')));
          });
        });

        module('when there is an unexpected error', function () {
          test('the login form displays a generic error message', async function (assert) {
            // given
            this.server.post('/oidc/user/check-reconciliation', undefined, 500);

            const screen = await visit('/connexion/oidc-partner?code=code&state=state');
            await click(await screen.getByRole('link', { name: t('pages.oidc.signup.login-button') }));

            // when
            await fillIn(
              screen.getByRole('textbox', { name: t('pages.login-form.email.label') }),
              'no-account-with-this-email@example.net',
            );
            await fillIn(screen.getByLabelText(t('pages.login-form.password')), 'incorrect-password');

            await click(screen.getByRole('button', { name: t('pages.login-form.associate-account') }));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            // Translation common.api-error-messages.login-unexpected-error contains HTML
            // assert.ok(screen.getByText(t('common.api-error-messages.login-unexpected-error')));
            assert.ok(screen.getByText(new RegExp('Impossible de se connecter.')));
          });
        });
      });

      module('when the user confirms the addition of a new authentication method', function () {
        module('when the user is invited', function () {
          async function fillInAndSubmitLoginForm(screen) {
            await fillIn(
              await screen.getByRole('textbox', { name: t('pages.login-form.email.label') }),
              'harry@cover.com',
            );
            await fillIn(await screen.getByLabelText(t('pages.login-form.password')), 'pix123');
            await click(await screen.getByRole('button', { name: t('pages.login-form.associate-account') }));
          }

          module('when the user has already accepted Pix Orga terms of service', function () {
            test('he is redirected to his homepage', async function (assert) {
              // given
              const user = createUserWithMembershipAndTermsOfServiceAccepted();
              createPrescriberByUser({ user });

              const screen = await visit('/connexion/oidc-partner?code=code&state=state');
              await click(await screen.getByRole('link', { name: t('pages.oidc.signup.login-button') }));

              await fillInAndSubmitLoginForm(screen);
              await settled();

              // when
              await click(
                await screen.findByText(t('components.authentication.oidc-association-confirmation.confirm')),
              );

              // then
              await screen.findByText('Harry Cover');

              assert.strictEqual(currentURL(), '/');
              assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
            });
          });

          module('when the user has not accepted Pix Orga terms of service', function (hooks) {
            let screen;
            hooks.beforeEach(async function () {
              const user = createUserWithMembership();
              createPrescriberByUser({ user });
              screen = await visit('/connexion/oidc-partner?code=code&state=state');
              await click(await screen.getByRole('link', { name: t('pages.oidc.signup.login-button') }));

              await fillInAndSubmitLoginForm(screen);
            });

            test('he is redirected to the cgu page', async function (assert) {
              // given
              await click(
                await screen.findByText(t('components.authentication.oidc-association-confirmation.confirm')),
              );

              // then
              await screen.findByRole('heading', { name: t('components.terms-of-service.title.requested') });
              assert.strictEqual(currentURL(), '/cgu');
            });

            module('when the user accepts Pix Orga terms of service', function () {
              test('he is redirected to his homepage', async function (assert) {
                // given
                await click(
                  await screen.findByText(t('components.authentication.oidc-association-confirmation.confirm')),
                );

                // when
                await click(await screen.findByText(t('components.terms-of-service.actions.accept')));

                // then
                await screen.findByText('Harry Cover');
                assert.strictEqual(currentURL(), '/');
                assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
              });
            });
          });
        });

        module('when the SSO provider is already linked to the user', function () {
          test('the confirmation page displays a dedicated error message', async function (assert) {
            // given
            const user = createUserWithMembership();
            createPrescriberByUser({ user });

            this.server.post(
              '/oidc/user/reconcile',
              {
                errors: [{ code: 'SSO_PROVIDER_ALREADY_LINKED_TO_USER' }],
              },
              412,
            );

            const screen = await visit('/connexion/oidc-partner?code=code&state=state');
            await click(await screen.getByRole('link', { name: t('pages.oidc.signup.login-button') }));
            await fillIn(await screen.getByRole('textbox', { name: t('pages.login-form.email.label') }), user.email);
            await fillIn(await screen.getByLabelText(t('pages.login-form.password')), 'pix123');
            const loginButton = screen.getByRole('button', { name: t('pages.login-form.associate-account') });
            await click(loginButton);

            // when
            await click(await screen.findByText(t('components.authentication.oidc-association-confirmation.confirm')));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            // then
            assert.ok(screen.getByText(t('common.api-error-messages.account-conflict')));
          });
        });
      });
    });

    // TODO: Uncomment and make those tests work when the signup template is done
    //   module('when the user logs out', function () {
    //     toRenameToTest('it redirects the user to the logout URL', async function (assert) {
    //       // given
    //       const screen = await visit('/connexion/oidc-partner?code=code&state=state');
    //       await click(screen.getByLabelText(t('common.legal-documents.label')));
    //       await click(screen.getByRole('button', { name: 'Je crée mon compte' }));
    //       // eslint-disable-next-line ember/no-settled-after-test-helper
    //       await settled();
    //
    //       await click(screen.getByRole('button', { name: 'Lloyd Consulter mes informations' }));
    //
    //       // when
    //       await click(screen.getByRole('link', { name: 'Se déconnecter' }));
    //
    //       // then
    //       assert.strictEqual(currentURL(), '/deconnexion');
    //     });
    //   });
  });
});
