import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';
import sinon from 'sinon';
import { later } from '@ember/runloop';
import ENV from 'pix-certif/config/environment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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

  module('when FT_DIFFERENTIATED_TIME_INVIGILATOR_PORTAL is enabled', function () {
    module('When there are candidates on the session', function () {
      test('it should display candidates entries', async function (assert) {
        // given
        const sessionId = 12345;
        server.create('feature-toggle', { isDifferentiatedTimeInvigilatorPortalEnabled: true });
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
            }),
            server.create('certification-candidate-for-supervising', {
              id: 456,
              firstName: 'Star',
              lastName: 'Lord',
              birthdate: '1983-06-28',
              extraTimePercentage: 12,
              authorizedToStart: false,
            }),
            server.create('certification-candidate-for-supervising', {
              id: 789,
              firstName: 'Buffy',
              lastName: 'Summers',
              birthdate: '1987-05-28',
              extraTimePercentage: '6',
              authorizedToStart: true,
            }),
            server.create('certification-candidate-for-supervising', {
              id: 1000,
              firstName: 'Rupert',
              lastName: 'Giles',
              birthdate: '1934-06-28',
              extraTimePercentage: '15',
              authorizedToStart: false,
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
      server.create('feature-toggle', { isDifferentiatedTimeInvigilatorPortalEnabled: true });
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

      // then
      const secondVisit = await visit('/connexion-espace-surveillant');
      await fillIn(secondVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(secondVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
      await click(secondVisit.getByRole('button', { name: 'Surveiller la session' }));

      assert
        .dom(secondVisit.getByRole('button', { name: "Annuler la confirmation de présence de l'élève John Doe" }))
        .exists();
      assert
        .dom(secondVisit.queryByRole('button', { name: "Confirmer la présence de l'élève John Doe" }))
        .doesNotExist();
    });

    test('when supervisor cancel the presence of the candidate, it should update authorizedToStart', async function (assert) {
      // given
      const sessionId = 12345;
      server.create('feature-toggle', { isDifferentiatedTimeInvigilatorPortalEnabled: true });
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
          }),
          server.create('certification-candidate-for-supervising', {
            id: 456,
            firstName: 'Star',
            lastName: 'Lord',
            birthdate: '1983-06-28',
            extraTimePercentage: 12,
            authorizedToStart: false,
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
        .dom(screen.getByRole('checkbox', { name: "Annuler la confirmation de présence de l'élève John Doe" }))
        .exists();
      assert.dom(screen.getByRole('checkbox', { name: "Confirmer la présence de l'élève Star Lord" })).exists();
    });

    test('should refresh the candidate list periodically', async function (assert) {
      // given
      sinon.stub(ENV.APP, 'sessionSupervisingPollingRate').value(100);

      const sessionForSupervising = server.create('session-for-supervising', {
        id: 12345,
        certificationCandidates: [
          server.create('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'John',
            lastName: 'Doe',
            birthdate: '1984-05-28',
            extraTimePercentage: '8',
            authorizedToStart: true,
          }),
          server.create('certification-candidate-for-supervising', {
            id: 456,
            firstName: 'Star',
            lastName: 'Lord',
            birthdate: '1983-06-28',
            extraTimePercentage: 12,
            authorizedToStart: false,
          }),
        ],
      });

      let getSessionForSupervisingCount = 0;
      server.get('/sessions/:id/supervising', () => {
        getSessionForSupervisingCount++;
        return sessionForSupervising;
      });

      // when
      const screen = await visit('/connexion-espace-surveillant');
      await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert.expect(1);
      later(() => {
        assert.deepEqual(getSessionForSupervisingCount, 4);
      }, 300);
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
        }),
      ],
    });

    const firstVisit = await visit('/connexion-espace-surveillant');
    await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(firstVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
    await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

    // when
    await click(firstVisit.getByRole('checkbox', { name: "Confirmer la présence de l'élève John Doe" }));

    // then
    const secondVisit = await visit('/connexion-espace-surveillant');
    await fillIn(secondVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(secondVisit.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
    await click(secondVisit.getByRole('button', { name: 'Surveiller la session' }));
    assert
      .dom(secondVisit.getByRole('checkbox', { name: "Annuler la confirmation de présence de l'élève John Doe" }))
      .isChecked();
  });

  test('when supervisor checks and unchecks the candidate, it should update authorizedToStart', async function (assert) {
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
    await click(firstVisit.getByRole('checkbox', { name: "Confirmer la présence de l'élève John Doe" }));
    await click(firstVisit.getByRole('checkbox', { name: "Annuler la confirmation de présence de l'élève John Doe" }));

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
});
