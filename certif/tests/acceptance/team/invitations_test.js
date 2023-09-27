import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../../helpers/test-init';

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

  module('When user is admin', function () {
    test('displays invitations list', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted(
        undefined,
        'Centre de certification du pix',
        false,
        'ADMIN',
      );

      server.create('certification-center-invitation', {
        certificationCenterId: 123,
        email: 'camile.onette@example.net',
        updatedAt: new Date('2023-09-20'),
      });

      server.create('certification-center-invitation', {
        certificationCenterId: 123,
        email: 'camile.onette@example.net',
        updatedAt: new Date('2023-09-19'),
      });

      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/equipe/invitations');

      // then
      assert.strictEqual(currentURL(), '/equipe/invitations');
    });
  });
});
