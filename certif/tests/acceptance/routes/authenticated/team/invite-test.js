import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL, settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../../../helpers/setup-intl';
import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../../../../helpers/test-init';

module('Acceptance | Routes | Team | Invite', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user is an admin', function (hooks) {
    let userWithAdminRole;

    hooks.beforeEach(async function () {
      userWithAdminRole = createCertificationPointOfContactWithTermsOfServiceAccepted(
        undefined,
        'PIX Certification Center',
        false,
        'ADMIN',
      );
      await authenticateSession(userWithAdminRole.id);
    });

    test('sends one invitation', async function (assert) {
      // given
      const inputLabel = this.intl.t('pages.team-invite.input-label');
      const inviteButtonLabel = this.intl.t('pages.team-invite.invite-button');
      const email = 'flavie.eichouette@example.net';

      // when
      const screen = await visit('/equipe/inviter');
      await fillByLabel(inputLabel, email);
      await clickByName(inviteButtonLabel);
      await settled();

      // then
      const expectedEmail = email.replace(/ /g, '');
      assert.strictEqual(currentURL(), '/equipe/invitations');
      assert.dom(screen.getByText(expectedEmail)).exists();
      assert
        .dom(screen.getByText('Une invitation a bien été envoyée à l’adresse e-mail flavie.eichouette@example.net.'))
        .exists();
    });

    test('sends multiple invitations', async function (assert) {
      // given
      const inputLabel = this.intl.t('pages.team-invite.input-label');
      const inviteButtonLabel = this.intl.t('pages.team-invite.invite-button');
      const emails = 'flavie.eichouette@example.net,dick.tektiv@example.net';

      // when
      const screen = await visit('/equipe/inviter');
      await fillByLabel(inputLabel, emails);
      await clickByName(inviteButtonLabel);
      await settled();

      // then
      const expectedEmails = emails.replace(/ /g, '').split(',');
      assert.strictEqual(currentURL(), '/equipe/invitations');
      assert.dom(screen.getByText(expectedEmails[0])).exists();
      assert.dom(screen.getByText(expectedEmails[1])).exists();
      assert.dom(screen.getByText('Une invitation a bien été envoyée aux adresses e-mails listées.')).exists();
    });

    module('error cases', function (hooks) {
      let certificationCenterId;

      hooks.beforeEach(async function () {
        certificationCenterId = this.server.db.allowedCertificationCenterAccesses[0].id;
      });

      module('when the email address have an invalid format', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const inputLabel = this.intl.t('pages.team-invite.input-label');
          const inviteButtonLabel = this.intl.t('pages.team-invite.invite-button');
          const email = 'dic.tafone@';

          server.post(
            `/certification-centers/${certificationCenterId}/invitations`,
            {
              errors: [
                {
                  detail: 'error message',
                  status: '400',
                  title: 'Bad Request',
                  code: 'INVALID_EMAIL_ADDRESS_FORMAT',
                  meta: { emailAddress: email },
                },
              ],
            },
            400,
          );

          // when
          const screen = await visit('/equipe/inviter');
          await fillByLabel(inputLabel, email);
          await clickByName(inviteButtonLabel);
          await settled();

          // then
          const expectedErrorNotification = this.intl.t(
            'pages.team-invite.notifications.error.invitations.invalid-email-format',
          );
          assert.dom(screen.getByText(expectedErrorNotification)).exists();
          assert.strictEqual(currentURL(), '/equipe/inviter');
        });
      });

      module('when the email address have an invalid domain name', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const inputLabel = this.intl.t('pages.team-invite.input-label');
          const inviteButtonLabel = this.intl.t('pages.team-invite.invite-button');
          const email = 'dic.tafone@kjqsbfzdifubidqshjfbdsjlhfvjqdshf.uyt';

          server.post(
            `/certification-centers/${certificationCenterId}/invitations`,
            {
              errors: [
                {
                  detail: 'error message',
                  status: '400',
                  title: 'Bad Request',
                  code: 'INVALID_EMAIL_DOMAIN',
                },
              ],
            },
            400,
          );

          // when
          const screen = await visit('/equipe/inviter');
          await fillByLabel(inputLabel, email);
          await clickByName(inviteButtonLabel);
          await settled();

          // then
          const expectedErrorNotification = this.intl.t(
            'pages.team-invite.notifications.error.invitations.invalid-email-domain',
          );
          assert.dom(screen.getByText(expectedErrorNotification)).exists();
          assert.strictEqual(currentURL(), '/equipe/inviter');
        });
      });

      module('when the email provider is unavailable', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const inputLabel = this.intl.t('pages.team-invite.input-label');
          const inviteButtonLabel = this.intl.t('pages.team-invite.invite-button');
          const email = 'dic.tafone@example.net';

          server.post(
            `/certification-centers/${certificationCenterId}/invitations`,
            {
              errors: [
                {
                  detail: 'error message',
                  status: '503',
                  title: 'Service unavailable',
                  code: 'SENDING_EMAIL_FAILED',
                },
              ],
            },
            503,
          );

          // when
          const screen = await visit('/equipe/inviter');
          await fillByLabel(inputLabel, email);
          await clickByName(inviteButtonLabel);
          await settled();

          // then
          const expectedErrorNotification = this.intl.t(
            'pages.team-invite.notifications.error.invitations.mailer-provider-unavailable',
          );
          assert.dom(screen.getByText(expectedErrorNotification)).exists();
          assert.strictEqual(currentURL(), '/equipe/inviter');
        });
      });
    });
  });
});
