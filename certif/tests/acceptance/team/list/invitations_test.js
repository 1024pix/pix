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
      test('removes the invitation', async function (assert) {
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
      });
    });
  });
});
