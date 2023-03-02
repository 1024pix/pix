import { module, test } from 'qunit';
import { click, currentURL, fillIn, find, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | Session Details Certification Candidates', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      const session = server.create('session');

      // when
      await visit(`/sessions/${session.id}/candidats`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when certificationPointOfContact is logged in', function (hooks) {
    let allowedCertificationCenterAccess;
    let certificationPointOfContact;
    let session;

    hooks.beforeEach(async () => {
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
        habilitations: [],
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
        pixCertifTermsOfServiceAccepted: true,
      });
      session = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should redirect from candidates to session list on click on return button', async function (assert) {
      // when
      const screen = await visit(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Revenir à la liste des sessions' }));

      // then
      assert.deepEqual(currentURL(), '/sessions/liste');
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    module('when there is no candidates yet', function () {
      test('it should display a download button and upload button', async function (assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.contains('Télécharger (.ods)');
        assert.contains('Importer (.ods)');
      });

      test('it should display a sentence when there is no certification candidates yet', async function (assert) {
        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.dom('table tbody').doesNotExist();
        assert.contains('En attente de candidats');
      });
    });

    module('when there are some candidates', function (hooks) {
      let sessionWithCandidates;
      let candidates;

      hooks.beforeEach(function () {
        sessionWithCandidates = server.create('session', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });
        candidates = server.createList('certification-candidate', 3, {
          sessionId: sessionWithCandidates.id,
          isLinked: false,
          resultRecipientEmail: 'recipient@example.com',
        });
      });

      test('it should display details modal button', async function (assert) {
        // when
        await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.contains('Voir le détail');
      });

      test('it should display the list of certification candidates ', async function (assert) {
        // given
        const dayjs = this.owner.lookup('service:dayjs');
        const aCandidate = candidates[0];

        // when
        const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.strictEqual(screen.getAllByRole('row').length, 4);
        assert.dom(screen.getByRole('cell', { name: aCandidate.lastName })).exists();
        assert.dom(screen.getByRole('cell', { name: aCandidate.firstName })).exists();
        assert
          .dom(screen.getByRole('cell', { name: dayjs.self(aCandidate.birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY') }))
          .exists();
        assert.contains(aCandidate.resultRecipientEmail);
        assert.dom(screen.getByRole('cell', { name: aCandidate.externalId })).exists();
      });

      module('when the details button is clicked', function () {
        test('it should display the candidate details modal', async function (assert) {
          // given
          const aCandidate = candidates[0];

          // when
          const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          await click(
            screen.getByLabelText(`Voir le détail du candidat ${aCandidate.firstName} ${aCandidate.lastName}`)
          );
          await screen.findByRole('dialog');

          // then
          assert.contains('Détail du candidat');
          assert.contains('Commune de naissance');
          assert.contains(aCandidate.birthCity);
          assert.contains(aCandidate.sex === 'F' ? 'Femme' : 'Homme');
        });
      });

      module('on import', function () {
        test('it should replace the candidates list with the imported ones', async function (assert) {
          // given
          const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: `${sessionWithCandidates.id}.add-two-candidates` });

          // when
          const input = await screen.findByLabelText('Importer (.ods)');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert.dom('table tbody tr').exists({ count: 2 });
        });

        test('it should display a success message when uploading a valid file', async function (assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: 'valid-file' });

          // when
          const input = find('#upload-attendance-sheet');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert
            .dom('[data-test-notification-message="success"]')
            .hasText('La liste des candidats a été importée avec succès.');
        });

        test('it should display the error message when uploading an invalid file', async function (assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: 'invalid-file' });

          // when
          const input = find('#upload-attendance-sheet');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert
            .dom('[data-test-notification-message="error"]')
            .hasText(
              "Aucun candidat n’a été importé. Une erreur personnalisée. Veuillez télécharger à nouveau le modèle de liste des candidats et l'importer à nouveau."
            );
        });

        test('it should display the error message when uploading a file with validation error', async function (assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: 'validation-error' });

          // when
          const input = find('#upload-attendance-sheet');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert
            .dom('[data-test-notification-message="error"]')
            .hasText('Aucun candidat n’a été importé. Une erreur personnalisée.');
        });

        test('it should display a specific error message when importing is forbidden', async function (assert) {
          // given
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: 'forbidden-import' });

          // when
          const input = find('#upload-attendance-sheet');
          await triggerEvent(input, 'change', { files: [file] });

          // then
          assert
            .dom('[data-test-notification-message="error"]')
            .hasText("La session a débuté, il n'est plus possible de modifier la liste des candidats.");
        });

        test('it should display a warning when the import is not allowed', async function (assert) {
          // given
          server.create('certification-candidate', { sessionId: sessionWithCandidates.id, isLinked: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

          // then
          assert
            .dom('.panel-actions__warning')
            .hasText(
              'La session a débuté, vous ne pouvez plus importer une liste de candidats.Si vous souhaitez modifier la liste, vous pouvez inscrire un candidat directement dans le tableau ci-dessous.'
            );
        });
      });
    });

    test('it should redirect to the default candidates detail view', async function (assert) {
      // given
      const linkToCandidate = '.session-details__controls-navbar-tabs a:nth-of-type(2)';
      const connectedcertificationPointOfContactId = certificationPointOfContact.id;
      await authenticateSession(connectedcertificationPointOfContactId);

      // when
      await visit(`/sessions/${session.id}`);
      await click(linkToCandidate);

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when the addCandidate button is clicked', function () {
      test('it should open the new Certification Candidate Modal', async function (assert) {
        // given
        const sessionWithoutCandidates = server.create('session', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });
        server.create('country', []);

        // when
        const screen = await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);
        await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));

        // then
        await screen.findByRole('dialog');
        assert.contains('Inscrire le candidat');
      });

      module('when the addCandidate button is clicked a second time', function (hooks) {
        hooks.beforeEach(async function () {
          server.createList('country', 2, { code: '99100' });
        });

        test('it should open the new Certification Candidate Modal with empty input', async function (assert) {
          // given
          const sessionWithoutCandidates = server.create('session', {
            certificationCenterId: allowedCertificationCenterAccess.id,
          });
          const screen = await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);

          await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
          await fillIn(screen.getByLabelText('* Nom de famille'), 'BackStreet');
          await fillIn(screen.getByLabelText('* Prénom'), 'Boys');
          await click(screen.getByLabelText('Homme'));
          await fillIn(screen.getByLabelText('* Date de naissance'), '01/01/2000');
          await fillIn(screen.getByLabelText('* Pays de naissance'), '99100');
          await click(screen.getByLabelText('Code INSEE'));
          await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
          await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
          await fillIn(screen.getByLabelText('Temps majoré (%)'), '20');
          await click(screen.getByLabelText('* Tarification part Pix'));
          await click(
            await screen.findByRole('option', {
              name: 'Prépayée',
            })
          );
          await fillIn(screen.getByLabelText('Code de prépaiement'), '12345');
          await fillIn(
            screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)'),
            'guybrush.threepwood@example.net'
          );
          await fillIn(screen.getByLabelText('E-mail de convocation'), 'roooooar@example.net');

          await click(screen.getByRole('button', { name: 'Fermer' }));

          // when
          await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));

          // then
          assert.strictEqual(screen.getByLabelText('* Nom de famille').value, '');
          assert.strictEqual(screen.getByLabelText('* Prénom').value, '');
          assert.false(screen.getByLabelText('Homme').checked);
          assert.strictEqual(screen.getByLabelText('* Date de naissance').value, '');
          assert.strictEqual(screen.getByLabelText('Identifiant externe').value, '');
          assert.strictEqual(screen.getByLabelText('* Code INSEE de naissance').value, '');
          assert.strictEqual(screen.getByLabelText('Temps majoré (%)').value, '');
          assert.strictEqual(screen.getByLabelText('* Tarification part Pix').value, '');
          assert.strictEqual(screen.getByLabelText('Code de prépaiement').value, '');
          assert.strictEqual(
            screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)').value,
            ''
          );
          assert.strictEqual(screen.getByLabelText('E-mail de convocation').value, '');
        });
      });

      module('when the new candidate form is submitted', function () {
        test('it should display the error message when the submitted form data is incorrect', async function (assert) {
          // given
          const session = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
          server.createList('country', 2, { code: '99100' });

          this.server.post(
            '/sessions/:id/certification-candidates',
            () => ({
              errors: [
                {
                  status: '422',
                  detail: 'An error message',
                },
              ],
            }),
            422
          );

          // when
          const screen = await visit(`/sessions/${session.id}/candidats`);
          await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
          await _fillFormWithCorrectData(screen);
          await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

          // then
          assert.dom('[data-test-notification-message="error"]').hasText('An error message');
        });

        module('when candidate data is valid', function (hooks) {
          hooks.beforeEach(async function () {
            server.createList('country', 2, { code: '99100' });
            session = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
          });

          test('it should display a success notification', async function (assert) {
            // when
            const screen = await visit(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
            await _fillFormWithCorrectData(screen);
            await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

            // then
            assert.dom('[data-test-notification-message="success"]').hasText('Le candidat a été inscrit avec succès.');
          });

          test('it should add a new candidate', async function (assert) {
            // when
            const screen = await visit(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
            await _fillFormWithCorrectData(screen);
            await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

            // then
            assert.dom('table tbody tr').exists({ count: 1 });
          });

          module('when shouldDisplayPaymentOptions is true', function () {
            test('it should add a new candidate with billing information', async function (assert) {
              // given
              allowedCertificationCenterAccess.update({ type: 'SUP' });

              const screen = await visit(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
              await fillIn(screen.getByLabelText('* Prénom'), 'Guybrush');
              await fillIn(screen.getByLabelText('* Nom de famille'), 'Threepwood');
              await fillIn(screen.getByLabelText('* Date de naissance'), '28/04/2019');
              await click(screen.getByLabelText('Homme'));
              await fillIn(screen.getByLabelText('* Pays de naissance'), '99100');
              await click(screen.getByLabelText('Code INSEE'));
              await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
              await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
              await click(screen.getByLabelText('* Tarification part Pix'));
              await click(
                await screen.findByRole('option', {
                  name: 'Prépayée',
                })
              );

              await fillIn(screen.getByLabelText('Code de prépaiement'), '12345');

              // when
              await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

              // then
              assert.dom('table tbody tr').exists({ count: 1 });
              assert.contains('Prépayée 12345');
            });
          });
        });
      });
    });
  });

  async function _fillFormWithCorrectData(screen) {
    await fillIn(screen.getByLabelText('* Prénom'), 'Guybrush');
    await fillIn(screen.getByLabelText('* Nom de famille'), 'Threepwood');
    await fillIn(screen.getByLabelText('* Date de naissance'), '28/04/2019');
    await click(screen.getByLabelText('Homme'));
    await fillIn(screen.getByLabelText('* Pays de naissance'), '99100');
    await click(screen.getByLabelText('Code INSEE'));
    await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
    await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
    await fillIn(screen.getByLabelText('Temps majoré (%)'), '20');
    await click(screen.getByLabelText('* Tarification part Pix'));
    await click(
      await screen.findByRole('option', {
        name: 'Gratuite',
      })
    );
    await fillIn(
      screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)'),
      'guybrush.threepwood@example.net'
    );
    await fillIn(screen.getByLabelText('E-mail de convocation'), 'roooooar@example.net');
  }
});
