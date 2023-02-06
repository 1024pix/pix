import { module, test } from 'qunit';
import { currentURL, triggerEvent, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithCustomCenters,
  createAllowedCertificationCenterAccess,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Import', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  module('When certificationPointOfContact is not authenticated', function () {
    test('it should not be accessible', async function (assert) {
      // when
      await visit('/sessions/import');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is authenticated', function (hooks) {
    let allowedCertificationCenterAccess;

    hooks.beforeEach(async function () {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        id: 123,
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
      });

      await authenticateSession(certificationPointOfContact.id);
    });

    module('when importing multiple sessions', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        const certificationCenter = createAllowedCertificationCenterAccess({
          certificationCenterName: 'Centre SUP',
          certificationCenterType: 'SUP',
        });
        certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [certificationCenter],
        });
        await authenticateSession(certificationPointOfContact.id);
        server.create('session-summary', { certificationCenterId: certificationCenter.id });
        server.create('feature-toggle', { id: 0, isMassiveSessionManagementEnabled: true });
      });

      module('when the file is valid', function () {
        test('it should display success message and reload sessions', async function (assert) {
          // given
          const file = new Blob(['foo'], { type: 'valid-file' });

          // when
          screen = await visit('/sessions/import');
          const input = await screen.findByLabelText('Importer le modèle complété');
          await triggerEvent(input, 'change', { files: [file] });
          const importButton = await screen.findByText('Continuer');
          await click(importButton);

          // then
          assert
            .dom('[data-test-notification-message="success"]')
            .hasText('La liste des sessions a été importée avec succès.');
        });
      });

      module('when the file is not valid', function () {
        test('it should display an error message and not upload any session', async function (assert) {
          //given
          const file = new Blob(['foo'], { type: 'invalid-file' });

          // when
          screen = await visit('/sessions/import');
          const input = await screen.findByLabelText('Importer le modèle complété');
          await triggerEvent(input, 'change', { files: [file] });
          const importButton = await screen.findByText('Continuer');
          await click(importButton);

          // then
          assert.dom('[data-test-notification-message="error"]').hasText("Aucune session n'a été importée");
        });
      });
    });
  });
});
