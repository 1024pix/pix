import { module, test } from 'qunit';
import { fillIn, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit as visitScreen } from '@pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Supervisor Portal', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [],
    });
    await authenticateSession(certificationPointOfContact.id);

    server.create('session-for-supervising', { id: 12345 });
  });

  module('When supervisor authentication is successful', function() {
    test('it should redirect to ', async function(assert) {
      // given
      const screen = await visitScreen('/connexion-espace-surveillant');
      await fillIn(screen.getByLabelText('Numéro de la session'), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session'), '6789');

      // when
      await click(screen.getByText('Surveiller la session'));

      // then
      assert.equal(currentURL(), '/sessions/12345/surveiller');
    });
  });
});
