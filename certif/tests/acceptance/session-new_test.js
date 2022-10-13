import { module, test } from 'qunit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';

module('Acceptance | Session creation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated user', async function (assert) {
    // when
    await visit('/sessions/creation');

    // then
    assert.strictEqual(currentURL(), '/connexion');
  });

  module('when the user is authenticated', (hooks) => {
    let allowedCertificationCenterAccess;
    let certificationPointOfContact;

    hooks.beforeEach(async function () {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
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

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit('/sessions/creation');

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should create a session and redirect to session details', async function (assert) {
      // given
      const sessionDate = '2029-12-25';
      const sessionFormattedTime = '02/02/2019 13:45';
      const sessionTime = new Date(sessionFormattedTime);

      const screen = await visit('/sessions/creation');
      assert.dom(screen.getByRole('textbox', { name: 'Nom de la salle' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Surveillant(s)' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Nom du site' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Observations' })).hasAttribute('maxLength', '350');
      assert.dom(screen.getByRole('textbox', { name: 'Heure de début (heure locale)' })).exists();
      assert.dom(screen.getByText('Date de début')).exists();
      assert.dom(screen.getByRole('button', { name: 'Créer la session' })).exists();
      assert
        .dom(
          screen.getByRole('button', { name: 'Annuler la création de session et retourner vers la page précédente' })
        )
        .exists();

      await fillIn(screen.getByRole('textbox', { name: 'Nom du site' }), 'My address');
      await fillIn(screen.getByRole('textbox', { name: 'Nom de la salle' }), 'My room');
      await fillIn(screen.getByRole('textbox', { name: 'Surveillant(s)' }), 'My examiner');
      await fillIn(screen.getByRole('textbox', { name: 'Observations' }), 'My description');
      await setFlatpickrDate('#session-date', sessionDate);
      await setFlatpickrDate(screen.getByRole('textbox', { name: 'Heure de début (heure locale)' }), sessionTime);
      await click(screen.getByRole('button', { name: 'Créer la session' }));

      // then
      const session = server.schema.sessions.findBy({ date: sessionDate });
      assert.strictEqual(session.address, 'My address');
      assert.strictEqual(session.room, 'My room');
      assert.strictEqual(session.examiner, 'My examiner');
      assert.strictEqual(session.description, 'My description');
      assert.strictEqual(session.date, sessionDate);
      assert.strictEqual(session.time, '13:45');
      assert.strictEqual(currentURL(), `/sessions/${session.id}`);
    });

    test('it should go back to sessions list on cancel without creating any sessions', async function (assert) {
      // given
      const previousSessionsCount = server.schema.sessions.all().length;
      const screen = await visit('/sessions/creation');

      // when
      await click(
        screen.getByRole('button', { name: 'Annuler la création de session et retourner vers la page précédente' })
      );

      // then
      const actualSessionsCount = server.schema.sessions.all().length;
      assert.strictEqual(currentURL(), '/sessions/liste');
      assert.strictEqual(previousSessionsCount, actualSessionsCount);
    });
  });
});
