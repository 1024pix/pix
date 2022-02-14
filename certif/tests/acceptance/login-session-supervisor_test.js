import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Login session supervisor', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      email: 'toto@example.net',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [],
    });
    await authenticateSession(certificationPointOfContact.id);

    server.create('session-for-supervising', { id: 12345 });
  });

  test('should display current user email and a change account button', async function (assert) {
    // given
    const screen = await visitScreen('/connexion-espace-surveillant');

    // then
    assert.dom(screen.getByText('toto@example.net')).exists();
    assert.dom(screen.getByText('Changer de compte')).exists();
  });

  module('When supervisor wants to change account', function () {
    test('it should redirect to logout page', async function (assert) {
      // given
      const screen = await visitScreen('/connexion-espace-surveillant');

      // when
      await click(screen.getByRole('link', { name: 'Changer de compte' }));

      // then
      assert.strictEqual(currentURL(), '/logout');
    });
  });
});
