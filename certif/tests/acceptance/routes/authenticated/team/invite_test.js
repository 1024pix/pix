import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { currentURL, visit } from '@ember/test-helpers';
import { clickByName, fillByLabel } from '@1024pix/ember-testing-library';

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
      await visit('/equipe/inviter');
      await fillByLabel(inputLabel, email);
      await clickByName(inviteButtonLabel);

      // then
      const expectedEmail = email.replace(/ /g, '');
      assert.strictEqual(currentURL(), '/equipe/invitations');
      assert.contains(expectedEmail);
      assert.contains(
        this.intl.t('pages.team-invite.notifications.success.invitations', { emailsCount: 1, email: expectedEmail }),
      );
    });

    test('sends multiple invitations', async function (assert) {
      // given
      const inputLabel = this.intl.t('pages.team-invite.input-label');
      const inviteButtonLabel = this.intl.t('pages.team-invite.invite-button');
      const emails = 'flavie.eichouette@example.net,dick.tektiv@example.net';

      // when
      await visit('/equipe/inviter');
      await fillByLabel(inputLabel, emails);
      await clickByName(inviteButtonLabel);

      // then
      const expectedEmails = emails.replace(/ /g, '').split(',');
      assert.strictEqual(currentURL(), '/equipe/invitations');
      assert.contains(expectedEmails[0]);
      assert.contains(expectedEmails[1]);
      assert.contains(
        this.intl.t('pages.team-invite.notifications.success.invitations', { emailsCount: expectedEmails.length }),
      );
    });

    module('error cases', function (hooks) {
      let certificationCenterId;

      hooks.beforeEach(async function () {
        certificationCenterId = this.server.db.allowedCertificationCenterAccesses[0].id;
      });

      module('when the email address have an invalid format', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const expectedErrorNotification = this.intl.t(
            'pages.team-invite.notifications.error.invitations.invalid-email-format',
          );

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
          await visit('/equipe/inviter');
          await fillByLabel(inputLabel, email);
          await clickByName(inviteButtonLabel);

          // then
          assert.strictEqual(currentURL(), '/equipe/inviter');
          assert.contains(expectedErrorNotification);
        });
      });

      module('when the email address have an invalid domain name', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const expectedErrorNotification = this.intl.t(
            'pages.team-invite.notifications.error.invitations.invalid-email-domain',
          );

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
          await visit('/equipe/inviter');
          await fillByLabel(inputLabel, email);
          await clickByName(inviteButtonLabel);

          // then
          assert.strictEqual(currentURL(), '/equipe/inviter');
          assert.contains(expectedErrorNotification);
        });
      });

      module('when the email provider is unavailable', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const expectedErrorNotification = this.intl.t(
            'pages.team-invite.notifications.error.invitations.mailer-provider-unavailable',
          );

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
          await visit('/equipe/inviter');
          await fillByLabel(inputLabel, email);
          await clickByName(inviteButtonLabel);

          // then
          assert.strictEqual(currentURL(), '/equipe/inviter');
          assert.contains(expectedErrorNotification);
        });
      });
    });
  });
});
