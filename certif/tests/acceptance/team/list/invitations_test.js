import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from '../../../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../../../helpers/test-init';
import { clickByName, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Team | Invitations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When user is member', function () {
    test('redirects to team members page', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/equipe');

      // then
      assert.strictEqual(currentURL(), '/equipe/membres');
    });
  });

  module('When user is admin', function (hooks) {
    hooks.beforeEach(async function () {
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted(
        undefined,
        'Centre de certification du pix',
        false,
        'ADMIN',
      );
      await authenticateSession(certificationPointOfContact.id);
    });

    test('displays invitations list', async function (assert) {
      // given
      this.server.create('certification-center-invitation', {
        certificationCenterId: 123,
        email: 'camile.onette@example.net',
        updatedAt: new Date('2023-09-20'),
      });
      this.server.create('certification-center-invitation', {
        certificationCenterId: 123,
        email: 'camile.onette@example.net',
        updatedAt: new Date('2023-09-19'),
      });

      // when
      await visit('/equipe/invitations');

      // then
      assert.strictEqual(currentURL(), '/equipe/invitations');
    });

    module('when user clicks on cancel invitation button', function () {
      test('removes the invitation and displays a success notification', async function (assert) {
        // given
        this.server.create('certification-center-invitation', {
          certificationCenterId: 1,
          email: 'daisy.draté@example.net',
          updatedAt: new Date('2023-11-30'),
        });

        const screen = await visit('/equipe/invitations');

        // when
        await clickByName(this.intl.t('pages.team-invitations.actions.cancel-invitation'));

        // then
        assert.dom(screen.queryByText('daisy.draté@example.net')).doesNotExist();
        assert.dom(screen.getByText('L’invitation a bien été supprimée.')).exists();
      });

      module('when an error occurs', function () {
        test('displays an error notification', async function (assert) {
          // given
          this.server.create('certification-center-invitation', {
            id: 15,
            certificationCenterId: 1,
            email: 'anna.liz@example.net',
            updatedAt: new Date('2023-11-30'),
          });
          this.server.delete(`/certification-center-invitations/15`, () => new Response(500));

          const screen = await visit('/equipe/invitations');

          // when
          await clickByName(this.intl.t('pages.team-invitations.actions.cancel-invitation'));

          // then
          assert.dom(screen.queryByText('anna.liz@example.net')).exists();
          assert
            .dom(
              screen.getByText(
                'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
              ),
            )
            .exists();
        });
      });
    });

    module('when user clicks on resend invitation button', function () {
      test('resends the invitation and displays a success notification', async function (assert) {
        // given
        this.server.create('certification-center-invitation', {
          certificationCenterId: 1,
          email: 'medhi.khaman@example.net',
          updatedAt: new Date('2023-12-05T11:30:00Z'),
        });

        const screen = await visit('/equipe/invitations');

        // when
        await clickByName(this.intl.t('pages.team-invitations.actions.resend-invitation'));

        // then
        assert.dom(screen.getByRole('cell', { name: 'medhi.khaman@example.net' })).exists();
        assert.dom(screen.getByRole('cell', { name: '05/12/2023 - 11:35' })).exists();
        assert.dom(screen.getByText("L'invitation a bien été renvoyée.")).exists();
      });

      module('when an error occurs', function () {
        test('displays an error notification', async function (assert) {
          // given
          this.server.create('certification-center-invitation', {
            id: 15,
            certificationCenterId: 1,
            email: 'anna.liz@example.net',
            updatedAt: new Date('2023-11-30'),
          });
          this.server.patch('/certification-center-invitations/15', () => new Response(500));

          const screen = await visit('/equipe/invitations');

          // when
          await clickByName(this.intl.t('pages.team-invitations.actions.resend-invitation'));

          // then
          assert.dom(screen.queryByText('anna.liz@example.net')).exists();
          assert
            .dom(
              screen.getByText(
                'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
              ),
            )
            .exists();
        });
      });
    });
  });
});
