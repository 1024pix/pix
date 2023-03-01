import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createUserMembershipWithRole, createPrescriberByUser } from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team Creation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  const email = 'user.to.invite@example.net';

  test('it should not be accessible by an unauthenticated prescriber', async function (assert) {
    // when
    await visit('/equipe/creation');

    // then
    assert.strictEqual(currentURL(), '/connexion');
  });

  module('When prescriber is logged in', function (hooks) {
    let organizationId;
    let user;

    hooks.afterEach(function () {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    module('When prescriber is a member', function (hooks) {
      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('it should not be accessible', async function (assert) {
        // when
        await visit('/equipe/creation');

        // then

        assert.strictEqual(currentURL(), '/campagnes/les-miennes');
      });
    });

    module('When prescriber is an admin', function (hooks) {
      let inputLabel;
      let cancelButton;
      let inviteButton;

      hooks.beforeEach(async function () {
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        organizationId = server.db.organizations[0].id;

        await authenticateSession(user.id);

        inputLabel = this.intl.t('pages.team-new-item.input-label');
        inviteButton = this.intl.t('pages.team-new-item.invite-button');
        cancelButton = this.intl.t('common.actions.cancel');
      });

      test('it should be accessible', async function (assert) {
        // when
        await visit('/equipe/creation');

        // then

        assert.strictEqual(currentURL(), '/equipe/creation');
      });

      test('it should allow to invite a prescriber, redirect to invitations list and display confirmation invitation message', async function (assert) {
        // given
        const code = 'ABCDEFGH01';
        server.create('user', {
          firstName: 'Gigi',
          lastName: 'La Brochette',
          email,
          pixOrgaTermsOfServiceAccepted: true,
        });

        await visit('/equipe/creation');
        await fillByLabel(inputLabel, email);

        // when
        await clickByName(inviteButton);

        // then
        const organizationInvitation = server.db.organizationInvitations[server.db.organizationInvitations.length - 1];

        assert.strictEqual(organizationInvitation.email, email);

        assert.strictEqual(organizationInvitation.status, 'PENDING');

        assert.strictEqual(organizationInvitation.code, code);

        assert.strictEqual(currentURL(), '/equipe/invitations');
        assert.contains(email);
        assert.contains(this.intl.t('pages.team-new.success.invitation', { email }));
      });

      test('it should display other confirm invitation message when there is multiple invitations', async function (assert) {
        // given
        const emails = 'elisa.agnard@example.net,fred.durand@example.net';

        await visit('/equipe/creation');
        await fillByLabel(inputLabel, emails);

        // when
        await clickByName(inviteButton);

        // then
        assert.contains(this.intl.t('pages.team-new.success.multiple-invitations'));
      });

      test('it should not allow to invite a prescriber when an email is not given', async function (assert) {
        // given
        await visit('/equipe/creation');
        await fillByLabel(inputLabel, '');

        // when
        await clickByName(inviteButton);

        // then

        assert.strictEqual(currentURL(), '/equipe/creation');
      });

      test('should display an empty input field after cancel and before add a team member', async function (assert) {
        // given
        await visit('/equipe/creation');
        await fillByLabel(inputLabel, email);
        await clickByName(cancelButton);

        // when
        await visit('/equipe/creation');

        // then
        assert.contains('');
      });

      test('should redirect to invitations list after cancelling on invite page', async function (assert) {
        // given
        await visit('/equipe/creation');

        // when
        await clickByName(cancelButton);

        // then

        assert.strictEqual(currentURL(), '/equipe/invitations');
      });

      test('it should display error on global form when error 500 is returned from backend', async function (assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.500');

        await visit('/equipe/creation');
        server.post(
          `/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '[Object object]',
                status: '500',
                title: 'Internal Server Error',
              },
            ],
          },
          500
        );
        await fillByLabel(inputLabel, email);

        // when
        await clickByName(inviteButton);

        // then

        assert.strictEqual(currentURL(), '/equipe/creation');
        assert.contains(expectedErrorMessage);
      });

      test('it should display error on global form when error 412 is returned from backend', async function (assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.412');

        await visit('/equipe/creation');
        server.post(
          `/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '',
                status: '412',
                title: 'Precondition Failed',
              },
            ],
          },
          412
        );
        await fillByLabel(inputLabel, email);

        // when
        await clickByName(inviteButton);

        // then

        assert.strictEqual(currentURL(), '/equipe/creation');
        assert.contains(expectedErrorMessage);
      });

      test('it should display error on global form when error 404 is returned from backend', async function (assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.404');

        await visit('/equipe/creation');
        server.post(
          `/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '',
                status: '404',
                title: 'Not Found',
              },
            ],
          },
          404
        );
        await fillByLabel(inputLabel, email);

        // when
        await clickByName(inviteButton);

        // then

        assert.strictEqual(currentURL(), '/equipe/creation');
        assert.contains(expectedErrorMessage);
      });

      test('it should display error on global form when error 400 is returned from backend', async function (assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.400');

        await visit('/equipe/creation');
        server.post(
          `/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '',
                status: '400',
                title: 'Bad Request',
              },
            ],
          },
          400
        );
        await fillByLabel(inputLabel, email);

        // when
        await clickByName(inviteButton);

        // then

        assert.strictEqual(currentURL(), '/equipe/creation');
        assert.contains(expectedErrorMessage);
      });

      module(
        'when error 400 is returned from backend because the mailing provider returns an invalid email error',
        function () {
          test('displays an error notification', async function (assert) {
            // Given
            const errorMessage = 'Mailing provider error message';
            const screen = await visit('/equipe/creation');
            server.post(
              `/organizations/${organizationId}/invitations`,
              {
                errors: [
                  {
                    detail: 'error message',
                    status: '400',
                    title: 'Bad Request',
                    code: 'SENDING_EMAIL_TO_INVALID_EMAIL_ADDRESS',
                    meta: { emailAddress: email, errorMessage },
                  },
                ],
              },
              400
            );
            await fillByLabel(inputLabel, email);

            // When
            await clickByName(inviteButton);

            // Then
            const expectedErrorMessage = this.intl.t('pages.team-new.errors.sending-email-to-invalid-email-address', {
              email,
              errorMessage,
            });
            assert.strictEqual(currentURL(), '/equipe/creation');
            assert.dom(screen.getByText(expectedErrorMessage)).exists();
          });
        }
      );
    });
  });
});
