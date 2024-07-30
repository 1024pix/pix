import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Supervisor Portal', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [],
    });
    await authenticateSession(certificationPointOfContact.id);

    server.create('session-for-supervising', { id: '12345' });
  });

  module('When supervisor authentication is successful', function () {
    test('it should redirect to supervising page', async function (assert) {
      // given
      const screen = await visitScreen('/connexion-espace-surveillant');
      await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert.strictEqual(currentURL(), '/sessions/12345/surveiller');
    });
  });

  module('When supervisor is supervising a session', function () {
    module('When quit button is clicked', function () {
      module('When action is confirmed through the modal', function () {
        test('it should redirect to the supervisor authentication page', async function (assert) {
          // given
          const screen = await visitScreen('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByText('Quitter'));

          await click(screen.getByText('Quitter la surveillance'));

          // then
          assert.strictEqual(currentURL(), '/connexion-espace-surveillant');
        });
      });
    });
  });
});
