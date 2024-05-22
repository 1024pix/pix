import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, currentURL, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Session Add Sco Students', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let allowedCertificationCenterAccess;
  let certificationPointOfContact;
  let session;
  const DEFAULT_PAGE_SIZE = 50;

  hooks.beforeEach(function () {
    allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
      type: 'SCO',
      isRelatedToManagingStudentsOrganization: true,
      isAccessBlockedCollege: false,
      isAccessBlockedLycee: false,
      isAccessBlockedAEFE: false,
      isAccessBlockedAgri: false,
    });
    certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
      pixCertifTermsOfServiceAccepted: true,
    });
    session = server.create('session-enrolment', { certificationCenterId: allowedCertificationCenterAccess.id });
    server.create('session-management', {
      id: session.id,
    });
    server.createList('country', 3);
  });

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // when
      await visit(`/sessions/${session.id}/inscription-eleves`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      allowedCertificationCenterAccess.update({ isAccessBlockedCollege: false });
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${session.id}/inscription-eleves`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should be possible to access student add page', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/inscription-eleves`);
      assert.dom(screen.getByRole('heading', { name: 'Inscrire des candidats' })).exists();
    });

    test('it should display support external link', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

      // then
      assert.dom(screen.getByRole('link', { name: 'support.pix.fr Ouverture dans une nouvelle fenêtre' })).exists();
    });

    test('it should be possible to return to candidates page from add student page', async function (assert) {
      // when
      const screen = await visitScreen(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
      await click(screen.getByRole('link', { name: 'Retour à la session' }));

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when there are no students', function () {
      test('it should show a empty list', async function (assert) {
        // when
        const screen = await visitScreen(`/sessions/${session.id}/candidats`);
        await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

        // then
        assert.dom(screen.queryByRole('columnheader', { name: 'Nom' })).doesNotExist();
        assert.dom(screen.queryByRole('columnheader', { name: 'Prénom' })).doesNotExist();
        assert.dom(screen.queryByRole('columnheader', { name: 'Classe' })).doesNotExist();
        assert.dom(screen.queryByRole('columnheader', { name: 'Date de naissance' })).doesNotExist();
      });
    });

    module('when there are some students', function () {
      test('it should be possible to filter student list by division', async function (assert) {
        // given
        server.create('student', {
          firstName: 'Alain',
          lastName: 'Cendy',
          division: '3A',
          birthdate: '2000-01-01',
          isSelected: false,
          isEnrolled: false,
        });
        server.create('division', { name: '3A' });

        const screen = await visitScreen(`/sessions/${session.id}/candidats`);
        await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
        await click(
          screen.getByRole('textbox', { name: 'Filtrer la liste des élèves en cochant la ou les classes souhaitées' }),
        );
        await screen.findByRole('menu');

        // when
        await click(screen.getByRole('checkbox', { name: '3A' }));

        // then
        const studentRowsLength = screen.getAllByRole('row').length;
        assert.strictEqual(studentRowsLength, 2);
      });

      module('when there are no enrolled students', function (hooks) {
        hooks.beforeEach(async () => {
          server.create('student', {
            firstName: 'Quentin',
            lastName: 'Lebouquetin',
            division: '3A',
            birthdate: '2000-01-01',
            isSelected: false,
            isEnrolled: false,
          });
          server.create('student', {
            firstName: 'Quentdeux',
            lastName: 'Lemouton',
            division: '2A',
            birthdate: '2000-01-01',
            isSelected: false,
            isEnrolled: false,
          });
          server.create('student', {
            firstName: 'Quenttrois',
            lastName: 'Lecabri',
            division: '3B',
            birthdate: '2000-01-01',
            isSelected: false,
            isEnrolled: false,
          });
          server.createList('student', DEFAULT_PAGE_SIZE);
        });

        test('it should show first page of students (with default size)', async function (assert) {
          // given
          const screen = await visitScreen(`/sessions/${session.id}/candidats`);

          // when
          await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

          // then
          const allRowLength = screen.getAllByRole('row').length;
          assert.strictEqual(allRowLength, DEFAULT_PAGE_SIZE + 1);
        });

        module('when selecting some students', function () {
          test('it should be possible to select 3 students', async function (assert) {
            // given
            const screen = await visitScreen(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
            const firstCheckbox = screen.getByRole('checkbox', {
              name: 'Sélectionner le candidat Quentin Lebouquetin',
            });
            const secondCheckbox = screen.getByRole('checkbox', {
              name: 'Sélectionner le candidat Quentdeux Lemouton',
            });
            const thirdCheckbox = screen.getByRole('checkbox', {
              name: 'Sélectionner le candidat Quenttrois Lecabri',
            });

            // when
            await click(firstCheckbox);
            await click(secondCheckbox);
            await click(thirdCheckbox);

            // then
            const allRowLength = screen.getAllByRole('row').length;
            assert.strictEqual(allRowLength, DEFAULT_PAGE_SIZE + 1);
            assert.dom(firstCheckbox).isChecked();
            assert.dom(secondCheckbox).isChecked();
            assert.dom(thirdCheckbox).isChecked();
          });

          test('it should cancel students enrolment', async function (assert) {
            // given
            const screen = await visitScreen(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

            // given
            const checkbox = screen.getByRole('checkbox', {
              name: 'Sélectionner le candidat Quentin Lebouquetin',
            });
            await click(checkbox);

            // when
            await click(screen.getByRole('link', { name: 'Annuler' }));

            // then
            assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
          });

          module('when clicking on "Ajout"', function () {
            test('it redirect to previous page', async function (assert) {
              // given
              const screen = await visitScreen(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
              const checkbox = screen.getByRole('checkbox', {
                name: 'Sélectionner le candidat Quentin Lebouquetin',
              });
              await click(checkbox);

              // when
              await click(screen.getByRole('button', { name: 'Inscrire' }));

              // then
              assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
            });

            test('it should add students as certification candidates', async function (assert) {
              // given
              const screen = await visitScreen(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));
              const firstCheckbox = screen.getByRole('checkbox', {
                name: 'Sélectionner le candidat Quentin Lebouquetin',
              });
              const secondCheckbox = screen.getByRole('checkbox', {
                name: 'Sélectionner le candidat Quentdeux Lemouton',
              });
              const thirdCheckbox = screen.getByRole('checkbox', {
                name: 'Sélectionner le candidat Quenttrois Lecabri',
              });

              // when
              await click(firstCheckbox);
              await click(secondCheckbox);
              await click(thirdCheckbox);
              const detailController = this.owner.lookup('controller:authenticated.sessions.details');

              // when
              await click(screen.getByRole('button', { name: 'Inscrire' }));

              // then
              const certificationCandidates = await detailController.model.certificationCandidates;
              assert.strictEqual(certificationCandidates.length, 3);
            });

            test('it should display confirmation message', async function (assert) {
              // given
              const screen = await visitScreen(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

              const checkbox = screen.getByRole('checkbox', {
                name: 'Sélectionner le candidat Quentin Lebouquetin',
              });
              await click(checkbox);

              // when
              await click(screen.getByRole('button', { name: 'Inscrire' }));

              // then
              assert.dom(screen.getByText('Le(s) candidat(s) ont été inscrit(s) avec succès.')).exists();
            });
          });
        });
      });

      module('when there are enrolled students', function (hooks) {
        hooks.beforeEach(async () => {
          server.create('student', {
            firstName: 'Quentin',
            lastName: 'Lebouquetin',
            division: '3A',
            birthdate: '2000-01-01',
            isSelected: false,
            isEnrolled: false,
          });
          const enrolledStudent = server.create('student', {
            firstName: 'Alain',
            lastName: 'Cendy',
            division: '3B',
            birthdate: '2000-01-01',
            isSelected: false,
            isEnrolled: true,
          });
          server.create('certification-candidate', {
            organizationLearnerId: enrolledStudent.id,
            sessionId: session.id,
          });
        });

        test('it should show label accordingly', async function (assert) {
          // given
          const screen = await visitScreen(`/sessions/${session.id}/candidats`);
          await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

          // when
          await click(screen.getByRole('checkbox', { name: 'Sélectionner le candidat Quentin Lebouquetin' }));

          // then
          assert.dom(screen.getByText('1 candidat(s) déjà inscrit(s) à la session')).exists();
          assert.dom(screen.getByText('1 candidat(s) sélectionné(s)')).exists();
        });

        test('it should be impossible to select enrolled student', async function (assert) {
          // given
          const screen = await visitScreen(`/sessions/${session.id}/candidats`);

          // when
          await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

          // then
          assert
            .dom(screen.getByRole('checkbox', { name: 'Candidat Alain Cendy sélectionné' }))
            .hasAttribute('disabled');
        });

        module('when toggle all click', function () {
          test('it should still show "1 candidat sélectionné | 1 candidat déjà ajouté à la session"', async function (assert) {
            // given
            const screen = await visitScreen(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('link', { name: 'Inscrire des candidats' }));

            // when
            await click(screen.getByRole('checkbox', { name: 'Sélectionner tous les candidats de la liste' }));

            // then
            assert.dom(screen.getByText('1 candidat(s) déjà inscrit(s) à la session')).exists();
            assert.dom(screen.getByText('1 candidat(s) sélectionné(s)')).exists();
          });
        });
      });
    });
  });
});
