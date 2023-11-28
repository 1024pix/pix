import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { currentURL, click } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';

import { currentSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import {
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import ENV from '../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Acceptance | join', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let loginFormButton;

  hooks.beforeEach(function () {
    loginFormButton = this.intl.t('pages.login-or-register.login-form.button');
  });

  module('When prescriber tries to go on join page', function () {
    module('when organization-invitation exists', function () {
      test('remains on join page', async function (assert) {
        // given
        const code = 'ABCDEFGH01';
        const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        const organizationInvitationId = server.create('organizationInvitation', {
          organizationId,
          email: 'random@email.com',
          status: 'pending',
          code,
        }).id;

        // when
        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);

        // then
        assert.strictEqual(currentURL(), `/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
      });
    });
    module(
      'When accessing the login page with "English" as selected language in url query params and select another language',
      function () {
        test('remains on join page whithout the query params', async function (assert) {
          // given
          const code = 'ABCDEFGH01';
          const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
          const organizationInvitationId = server.create('organizationInvitation', {
            organizationId,
            email: 'random@email.com',
            status: 'pending',
            code,
            organizationName: 'Le collège fou fou fou',
          }).id;

          // when
          const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`);

          assert.ok(screen.getByText('You have been invited to join the organisation Le collège fou fou fou'));

          await click(screen.getByRole('button', { name: 'English' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Français' }));

          // then
          assert.strictEqual(currentURL(), `/rejoindre?code=${code}&invitationId=${organizationInvitationId}`);
          assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
        });
      },
    );
    module('when organization-invitation does not exist', function () {
      test('redirects user to login page', async function (assert) {
        // when
        await visit('rejoindre?invitationId=123456&code=FAKE999');

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
      });
    });
    module('when organization-invitation has already been accepted', function () {
      test('redirects user to login page', async function (assert) {
        // given
        const code = 'ABCDEFGH01';
        const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        const organizationInvitationId = server.create('organizationInvitation', {
          organizationId,
          email: 'random@email.com',
          status: 'accepted',
          code,
        }).id;
        const expectedErrorMessage = this.intl.t('pages.login-form.invitation-already-accepted');

        // when
        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
        assert.ok('.login-form__invitation-error');
        assert.dom('.login-form__invitation-error').hasText(expectedErrorMessage);
      });
    });
    module('when organization-invitation has been cancelled', function () {
      test('redirects user to login page ', async function (assert) {
        // given
        const code = 'ABCDEFGH01';
        const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        const organizationInvitationId = server.create('organizationInvitation', {
          organizationId,
          email: 'random@email.com',
          status: 'cancelled',
          code,
        }).id;

        // when
        const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
        assert.ok(screen.getByText(this.intl.t('pages.login-form.invitation-was-cancelled')));
      });
    });
  });

  module('Login', function (hooks) {
    let emailInputLabel;
    let passwordInputLabel;
    let loginButton;

    hooks.beforeEach(function () {
      emailInputLabel = this.intl.t('pages.login-form.email');
      passwordInputLabel = this.intl.t('pages.login-form.password');
      loginButton = this.intl.t('pages.login-form.login');
    });

    module('When prescriber is logging in but has not accepted terms of service yet', function (hooks) {
      let user;
      let organizationInvitationId;
      let code;

      hooks.beforeEach(() => {
        user = createUserWithMembership();
        createPrescriberByUser(user);

        code = 'ABCDEFGH01';
        organizationInvitationId = server.create('organizationInvitation', {
          organizationId: user.userOrgaSettings.organization.id,
          email: 'random@email.com',
          status: 'pending',
          code,
        }).id;
      });

      test('redirects user to the terms-of-service page', async function (assert) {
        // given
        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await clickByName(loginFormButton);
        await fillByLabel(emailInputLabel, user.email);
        await fillByLabel(passwordInputLabel, 'secret');

        // when
        await clickByName(loginButton);

        // then

        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test("redirects user to the terms-of-service page in the user's language even if another language selected in join page", async function (assert) {
        // given
        const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);

        await click(screen.getByRole('button', { name: 'Français' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'English' }));

        await clickByName(this.intl.t('pages.login-or-register.login-form.button'));
        await fillByLabel(this.intl.t('pages.login-or-register.register-form.fields.email.label'), user.email);
        await fillByLabel(this.intl.t('pages.login-or-register.register-form.fields.password.label'), 'secret');

        // when
        await clickByName(this.intl.t('pages.login-or-register.login-form.button'));

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(screen.getByText("Condition générales d'utilisation de la plateforme Pix Orga"));
      });

      test('does not show menu nor top bar', async function (assert) {
        // given
        server.create('campaign');

        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await clickByName(loginFormButton);
        await fillByLabel(emailInputLabel, user.email);
        await fillByLabel(passwordInputLabel, 'secret');

        // when
        await clickByName(loginButton);

        // then
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

        assert.dom('.app__sidebar').doesNotExist();
        assert.dom('.main-content__topbar').doesNotExist();
      });
    });

    module('When prescriber is logging in and has accepted terms of service', function (hooks) {
      let user;
      let organizationInvitationId;
      let code;

      hooks.beforeEach(() => {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);

        code = 'ABCDEFGH01';
        organizationInvitationId = server.create('organizationInvitation', {
          organizationId: user.userOrgaSettings.organization.id,
          email: 'random@email.com',
          status: 'pending',
          code,
        }).id;
      });

      test('redirects user to the campaigns list that contains prescriber name', async function (assert) {
        // given
        server.create('campaign');

        const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await clickByName(loginFormButton);
        await fillByLabel(emailInputLabel, user.email);
        await fillByLabel(passwordInputLabel, 'secret');

        // when
        await clickByName(loginButton);

        // then
        assert.strictEqual(currentURL(), '/campagnes/les-miennes');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        assert.ok(screen.getByText('Harry Cover'));
      });
    });

    module('errors cases', function () {
      module('When prescriber is logging in but his credentials are invalid', function (hooks) {
        const code = 'ABCDEFGH01';

        let user;
        let organizationInvitationId;

        hooks.beforeEach(() => {
          user = createUserWithMembership();
          server.create('prescriber', { id: user.id });

          const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
          organizationInvitationId = server.create('organizationInvitation', {
            organizationId,
            email: 'random@email.com',
            status: 'pending',
            code,
          }).id;
        });

        test('remains on join page, even with multiple attempts', async function (assert) {
          // given
          server.post(
            '/token',
            {
              errors: [{ status: '401' }],
            },
            401,
          );

          const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          await clickByName(loginFormButton);
          await fillByLabel(emailInputLabel, user.email);
          await fillByLabel(passwordInputLabel, 'fakepassword');

          // when
          await clickByName(loginButton);
          // Multiple attempts on purpose
          await clickByName(loginButton);
          await clickByName(loginButton);

          // then

          assert.strictEqual(currentURL(), `/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
          assert.ok(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY)));
        });
      });

      module('When organization-invitation has already been accepted by another account', function (hooks) {
        let user;
        let organizationInvitationId;
        let code;

        hooks.beforeEach(() => {
          user = createUserWithMembership();
          createPrescriberByUser(user);

          code = 'ABCDEFGH01';
          const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
          organizationInvitationId = server.create('organizationInvitation', {
            organizationId,
            email: 'random@email.com',
            status: 'pending',
            code,
          }).id;
        });

        test('displays an error message', async function (assert) {
          // given
          server.post(
            `/organization-invitations/${organizationInvitationId}/response`,
            () => new Response(409, {}, { errors: [{ status: '409' }] }),
          );
          const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          await clickByName(loginFormButton);
          await fillByLabel(emailInputLabel, user.email);
          await fillByLabel(passwordInputLabel, 'secret');

          // when
          await clickByName(loginButton);

          // then
          assert.strictEqual(currentURL(), `/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
          assert.ok(screen.getByText(this.intl.t('pages.login-form.errors.status.409')));
        });
      });

      module(
        'When prescriber has already accepted organization-invitation or prescriber is already a member of the organization',
        function (hooks) {
          let user;
          let organizationInvitationId;
          let code;

          hooks.beforeEach(() => {
            user = createUserWithMembership();
            createPrescriberByUser(user);

            code = 'ABCDEFGH01';
            const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
            organizationInvitationId = server.create('organizationInvitation', {
              organizationId,
              email: 'random@email.com',
              status: 'pending',
              code,
            }).id;
          });

          test('redirects to terms-of-service page', async function (assert) {
            // given
            server.post(
              `/organization-invitations/${organizationInvitationId}/response`,
              {
                errors: [
                  {
                    detail: '',
                    status: '412',
                    title: '',
                  },
                ],
              },
              412,
            );
            await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
            await clickByName(loginFormButton);
            await fillByLabel(emailInputLabel, user.email);
            await fillByLabel(passwordInputLabel, 'secret');

            // when
            await clickByName(loginButton);

            // then
            assert.strictEqual(currentURL(), '/cgu');
            assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
          });
        },
      );
    });
  });

  module('Register', function (hooks) {
    let firstNameInputLabel;
    let lastNameInputLabel;
    let emailInputLabel;
    let passwordInputLabel;
    let cguAriaLabel;
    let registerButtonLabel;

    hooks.beforeEach(function () {
      firstNameInputLabel = this.intl.t('pages.login-or-register.register-form.fields.first-name.label');
      lastNameInputLabel = this.intl.t('pages.login-or-register.register-form.fields.last-name.label');
      emailInputLabel = this.intl.t('pages.login-or-register.register-form.fields.email.label');
      passwordInputLabel = this.intl.t('pages.login-or-register.register-form.fields.password.label');
      cguAriaLabel = this.intl.t('pages.login-or-register.register-form.fields.cgu.aria-label');
      registerButtonLabel = this.intl.t('pages.login-or-register.register-form.fields.button.label');
    });

    module('When prescriber is registering', function () {
      module('When a pending organization-invitation already exists', function (hooks) {
        let organizationId;

        hooks.beforeEach(() => {
          organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        });

        module('when join page is in french international language by default', function () {
          test('accepts invitation, create user and membership and redirect prescriber to the terms-of-service page', async function (assert) {
            // given
            const code = 'ABCDEFGH01';
            const organizationInvitationId = server.create('organizationInvitation', {
              organizationId,
              email: 'random@email.com',
              status: 'pending',
              code,
            }).id;

            await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
            await fillByLabel(firstNameInputLabel, 'pix');
            await fillByLabel(lastNameInputLabel, 'pix');
            await fillByLabel(emailInputLabel, 'shi@fu.me');
            await fillByLabel(passwordInputLabel, 'Password4register');
            await clickByName(cguAriaLabel);

            // when
            await clickByName(registerButtonLabel);

            // then
            assert.strictEqual(currentURL(), '/cgu');
            assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
            const organizationInvitation = server.db.organizationInvitations[0];
            assert.strictEqual(organizationInvitation.status, 'accepted');
          });
        });

        module('when user select english language', function () {
          test("redirects user to the terms-of-service page in the user's language selected", async function (assert) {
            // given
            const code = 'ENGLISH_USER_INVITATION_CODE';
            const organizationInvitationId = server.create('organizationInvitation', {
              organizationId,
              email: 'random@email.com',
              status: 'pending',
              code,
            }).id;

            const screen = await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
            await click(screen.getByRole('button', { name: 'Français' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'English' }));

            await fillByLabel(this.intl.t('pages.login-or-register.register-form.fields.first-name.label'), 'pix');
            await fillByLabel(this.intl.t('pages.login-or-register.register-form.fields.last-name.label'), 'pix');
            await fillByLabel(this.intl.t('pages.login-or-register.register-form.fields.email.label'), 'shi@fu.me');
            await fillByLabel(
              this.intl.t('pages.login-or-register.register-form.fields.password.label'),
              'Password4register',
            );
            await clickByName(this.intl.t('pages.login-or-register.register-form.fields.cgu.aria-label'));

            // when
            await clickByName(this.intl.t('pages.login-or-register.register-form.fields.button.label'));

            // then
            assert.strictEqual(currentURL(), '/cgu');
            assert.ok(screen.getByText('Terms and Conditions of use of the Pix Orga plateform'));
          });
        });
      });

      module('When prescriber already exist', function (hooks) {
        let organizationId;

        hooks.beforeEach(() => {
          organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        });

        test('redirects prescriber to the campaigns list', async function (assert) {
          // given
          const code = 'ABCDEFGH01';
          const organizationInvitationId = server.create('organizationInvitation', {
            organizationId,
            email: 'random@email.com',
            status: 'pending',
            code,
          }).id;

          server.post(
            '/users',
            {
              errors: [
                {
                  detail: '',
                  status: '422',
                  title: '',
                },
              ],
            },
            422,
          );

          await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          await fillByLabel(firstNameInputLabel, 'pix');
          await fillByLabel(lastNameInputLabel, 'pix');
          await fillByLabel(emailInputLabel, 'alreadyUser@organization.org');
          await fillByLabel(passwordInputLabel, 'Password4register');
          await clickByName(cguAriaLabel);

          // when
          await clickByName(registerButtonLabel);

          // then
          assert.strictEqual(currentURL(), `/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        });
      });
    });
  });
});
