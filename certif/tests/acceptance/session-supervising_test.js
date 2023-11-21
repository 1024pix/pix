import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn, waitUntil } from '@ember/test-helpers';
import { visit, within } from '@1024pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';
import { Response } from 'miragejs';
import sinon from 'sinon';
import ENV from 'pix-certif/config/environment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const isVisible = (element) => {
  return window.getComputedStyle(element).visibility !== 'hidden';
};

const waitUntilElementIsVisible = (element) => {
  return waitUntil(() => isVisible(element));
};

module('Acceptance | Session supervising', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    sinon.stub(ENV.APP, 'sessionSupervisingPollingRate').value(10000);
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [],
    });
    await authenticateSession(certificationPointOfContact.id);
  });

  module('When there are candidates on the session', function () {
    test('it should display candidates entries', async function (assert) {
      // given
      const sessionId = 12345;
      this.sessionForSupervising = server.create('session-for-supervising', {
        id: sessionId,
        certificationCandidates: [
          server.create('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'John',
            lastName: 'Doe',
            birthdate: '1984-05-28',
            extraTimePercentage: '8',
            authorizedToStart: true,
            liveAlert: {
              status: 'ongoing',
              hasEmbed: false,
              hasAttachment: false,
              isFocus: false,
              hasImage: false,
            },
          }),
          server.create('certification-candidate-for-supervising', {
            id: 456,
            firstName: 'Star',
            lastName: 'Lord',
            birthdate: '1983-06-28',
            extraTimePercentage: 12,
            authorizedToStart: false,
            liveAlert: null,
          }),
          server.create('certification-candidate-for-supervising', {
            id: 789,
            firstName: 'Buffy',
            lastName: 'Summers',
            birthdate: '1987-05-28',
            extraTimePercentage: '6',
            authorizedToStart: true,
            liveAlert: null,
          }),
          server.create('certification-candidate-for-supervising', {
            id: 1000,
            firstName: 'Rupert',
            lastName: 'Giles',
            birthdate: '1934-06-28',
            extraTimePercentage: '15',
            authorizedToStart: false,
            liveAlert: null,
          }),
        ],
      });

      const screen = await visit('/connexion-espace-surveillant');
      await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: "Confirmer la présence de l'élève Star Lord",
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: "Confirmer la présence de l'élève Rupert Giles",
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: "Annuler la confirmation de présence de l'élève John Doe",
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: "Annuler la confirmation de présence de l'élève Buffy Summers",
          }),
        )
        .exists();
    });
  });

  test('when supervisor checks the candidate, it should update authorizedToStart', async function (assert) {
    // given
    const sessionId = 12345;
    this.sessionForSupervising = server.create('session-for-supervising', {
      id: sessionId,
      certificationCandidates: [
        server.create('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'John',
          lastName: 'Doe',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
          authorizedToStart: false,
          liveAlert: {
            status: 'ongoing',
            hasEmbed: false,
            hasAttachment: false,
            isFocus: false,
            hasImage: false,
          },
        }),
      ],
    });

    const firstVisit = await visit('/connexion-espace-surveillant');
    await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(firstVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
    await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

    // when
    await click(firstVisit.getByRole('button', { name: "Confirmer la présence de l'élève John Doe" }));

    // then
    const secondVisit = await visit('/connexion-espace-surveillant');
    await fillIn(secondVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(secondVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
    await click(secondVisit.getByRole('button', { name: 'Surveiller la session' }));

    assert
      .dom(secondVisit.getByRole('button', { name: "Annuler la confirmation de présence de l'élève John Doe" }))
      .exists();
    assert.dom(secondVisit.queryByRole('button', { name: "Confirmer la présence de l'élève John Doe" })).doesNotExist();
  });

  test('when supervisor cancel the presence of the candidate, it should update authorizedToStart', async function (assert) {
    // given
    const sessionId = 12345;
    this.sessionForSupervising = server.create('session-for-supervising', {
      id: sessionId,
      certificationCandidates: [
        server.create('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'John',
          lastName: 'Doe',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
          authorizedToStart: false,
        }),
      ],
    });

    const firstVisit = await visit('/connexion-espace-surveillant');
    await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(firstVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
    await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

    // when
    await click(firstVisit.getByRole('button', { name: "Confirmer la présence de l'élève John Doe" }));
    await click(firstVisit.getByRole('button', { name: "Annuler la confirmation de présence de l'élève John Doe" }));

    // then
    assert.false(server.schema.certificationCandidateForSupervisings.find(123).authorizedToStart);
  });

  test('when supervisor allow to resume test, it should display a success notification', async function (assert) {
    // given
    const sessionId = 12345;
    this.sessionForSupervising = server.create('session-for-supervising', {
      id: sessionId,
      certificationCandidates: [
        server.create('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'John',
          lastName: 'Doe',
          birthdate: '1984-05-28',
          extraTimePercentage: null,
          authorizedToStart: true,
          assessmentStatus: 'started',
        }),
      ],
    });

    const firstVisit = await visit('/connexion-espace-surveillant');
    await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(firstVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
    await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

    // when
    await click(firstVisit.getByRole('button', { name: 'Afficher les options du candidat' }));
    await click(firstVisit.getByRole('button', { name: 'Autoriser la reprise du test' }));
    await firstVisit.findByRole('dialog');
    await click(firstVisit.getByRole('button', { name: "Je confirme l'autorisation" }));

    // then
    assert.contains('Succès ! John Doe peut reprendre son test de certification.');
  });

  module('when there is no current alert', function () {
    test('it should not display the option', async function (assert) {
      // given
      const sessionId = 12345;
      this.sessionForSupervising = server.create('session-for-supervising', {
        id: sessionId,
        certificationCandidates: [
          server.create('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'John',
            lastName: 'Doe',
            birthdate: '1984-05-28',
            extraTimePercentage: null,
            authorizedToStart: true,
            assessmentStatus: 'started',
          }),
        ],
      });

      const firstVisit = await visit('/connexion-espace-surveillant');
      await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(firstVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
      await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

      // when
      await click(firstVisit.getByRole('button', { name: 'Afficher les options du candidat' }));

      // then
      assert.dom('button[name="Gérer un signalement"]').doesNotExist();
    });
  });

  module('when supervisor handles a live alert', () => {
    module('when supervisor dismisses a live alert', function () {
      module('when there is no error', function () {
        test('it dismisses the live alert', async function (assert) {
          // given
          const sessionId = 12345;
          this.sessionForSupervising = server.create('session-for-supervising', {
            id: sessionId,
            certificationCandidates: [
              server.create('certification-candidate-for-supervising', {
                userId: 123,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: '1984-05-28',
                extraTimePercentage: null,
                authorizedToStart: true,
                assessmentStatus: 'started',
                liveAlert: {
                  status: 'ongoing',
                  hasEmbed: false,
                  hasAttachment: false,
                  isFocus: false,
                  hasImage: false,
                },
              }),
            ],
          });

          const screen = await visit('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));
          await click(screen.getByText('Refuser le signalement'));

          // then
          assert.dom(screen.getByText('Le signalement a bien été refusé.')).exists();
        });
      });

      module('when there is an error', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const sessionId = 123;
          const candidateId = 12345;
          server.patch(`/sessions/${sessionId}/candidates/${candidateId}/dismiss-live-alert`, () => new Response(400));
          this.sessionForSupervising = server.create('session-for-supervising', {
            id: sessionId,
            certificationCandidates: [
              server.create('certification-candidate-for-supervising', {
                userId: candidateId,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: '1984-05-28',
                extraTimePercentage: null,
                authorizedToStart: true,
                assessmentStatus: 'started',
                liveAlert: {
                  status: 'ongoing',
                },
              }),
            ],
          });

          const screen = await visit('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '123');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));
          await click(screen.getByText('Refuser le signalement'));

          // then
          assert.contains('Une erreur a eu lieu. Merci de réessayer ultérieurement.');
        });
      });
    });

    module('when supervisor validates a live alert', function () {
      module('when there is no error', function () {
        test('it validates the live alert', async function (assert) {
          // given
          const sessionId = 12345;
          const candidateId = 123;
          server.patch(`/sessions/${sessionId}/candidates/${candidateId}/validate-live-alert`, (schema, request) => {
            const body = JSON.parse(request.requestBody);
            if (body.subcategory === 'WEBSITE_BLOCKED') {
              return new Response(204);
            }

            return new Response(400);
          });

          this.sessionForSupervising = server.create('session-for-supervising', {
            id: sessionId,
            certificationCandidates: [
              server.create('certification-candidate-for-supervising', {
                userId: candidateId,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: '1984-05-28',
                extraTimePercentage: null,
                authorizedToStart: true,
                assessmentStatus: 'started',
                liveAlert: {
                  status: 'ongoing',
                  hasEmbed: false,
                  hasAttachment: false,
                  isFocus: false,
                  hasImage: false,
                },
              }),
            ],
          });

          const screen = await visit('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));

          await click(
            screen.getByLabelText(
              "E5 Le site est bloqué par les restrictions réseau de l'établissement (réseaux sociaux par ex.)",
            ),
          );

          await click(screen.getByText('Valider le signalement'));

          // then
          const successMessage = screen.getByText('Le signalement a bien été validé.');

          await waitUntilElementIsVisible(successMessage);

          assert.notStrictEqual(window.getComputedStyle(successMessage).visibility, 'hidden');
        });
      });

      module('when there is an error', function () {
        test('it displays an error notification', async function (assert) {
          // given
          const sessionId = 123;
          const candidateId = 12345;
          server.patch(`/sessions/${sessionId}/candidates/${candidateId}/validate-live-alert`, () => new Response(400));
          this.sessionForSupervising = server.create('session-for-supervising', {
            id: sessionId,
            certificationCandidates: [
              server.create('certification-candidate-for-supervising', {
                userId: candidateId,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: '1984-05-28',
                extraTimePercentage: null,
                authorizedToStart: true,
                assessmentStatus: 'started',
                liveAlert: {
                  status: 'ongoing',
                  hasEmbed: false,
                  hasAttachment: false,
                  isFocus: false,
                  hasImage: false,
                },
              }),
            ],
          });

          const screen = await visit('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '123');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));
          await click(
            screen.getByLabelText(
              "E5 Le site est bloqué par les restrictions réseau de l'établissement (réseaux sociaux par ex.)",
            ),
          );

          await click(screen.getByText('Valider le signalement'));

          // then
          assert.contains('Une erreur a eu lieu. Merci de réessayer ultérieurement.');
        });
      });
    });

    module('when exiting the form', function () {
      module('when dismissing the alert', function () {
        test('it should reset the form', async function (assert) {
          // given
          const sessionId = 12345;
          this.sessionForSupervising = server.create('session-for-supervising', {
            id: sessionId,
            certificationCandidates: [
              server.create('certification-candidate-for-supervising', {
                userId: 123,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: '1984-05-28',
                extraTimePercentage: null,
                authorizedToStart: true,
                assessmentStatus: 'started',
                liveAlert: {
                  status: 'ongoing',
                  hasEmbed: false,
                  hasAttachment: false,
                  isFocus: false,
                  hasImage: false,
                },
              }),
            ],
          });

          const screen = await visit('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));
          await click(screen.getByLabelText('E4 Le site à visiter est indisponible/en maintenance/inaccessible'));
          await click(screen.getByText('Refuser le signalement'));

          const closeButtons = screen.getAllByText('Fermer');
          await waitUntil(() => closeButtons.filter((element) => isVisible(element)).length > 0);

          const visibleCloseButton = closeButtons.filter((element) => isVisible(element))[0];
          await click(visibleCloseButton);
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));
          // then
          const checkedRadioButtons = screen.queryAllByRole('radio', { checked: true });
          assert.strictEqual(checkedRadioButtons.length, 0);
        });
      });
      module('when closing the modal', function () {
        test('it should reset the form', async function (assert) {
          // given
          const sessionId = 12345;
          this.sessionForSupervising = server.create('session-for-supervising', {
            id: sessionId,
            certificationCandidates: [
              server.create('certification-candidate-for-supervising', {
                userId: 123,
                firstName: 'John',
                lastName: 'Doe',
                birthdate: '1984-05-28',
                extraTimePercentage: null,
                authorizedToStart: true,
                assessmentStatus: 'started',
                liveAlert: {
                  status: 'ongoing',
                  hasEmbed: false,
                  hasAttachment: false,
                  isFocus: false,
                  hasImage: false,
                },
              }),
            ],
          });

          const screen = await visit('/connexion-espace-surveillant');
          await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
          await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Gérer un signalement' }));
          await click(screen.getByLabelText('E4 Le site à visiter est indisponible/en maintenance/inaccessible'));

          const modal = await screen.findByRole('dialog');
          await click(within(modal).getByLabelText('Fermer'));

          // then
          const checkedRadioButtons = screen.queryAllByRole('radio', { checked: true });
          assert.strictEqual(checkedRadioButtons.length, 0);
        });
      });
    });
  });
});
