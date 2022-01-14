import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn, find } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session supervising', function (hooks) {
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
            extraTimePercentage: '12',
            authorizedToStart: false,
          }),
        ],
      });

      const screen = await visitScreen('/connexion-espace-surveillant');
      await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
      await fillIn(screen.getByLabelText('Mot de passe de la session'), '6789');

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert.dom(screen.getByRole('checkbox', { name: 'Doe John' })).exists();
      assert.dom(screen.getByRole('checkbox', { name: 'Lord Star' })).exists();
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

    const firstVisit = await visitScreen('/connexion-espace-surveillant');
    await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(firstVisit.getByLabelText('Mot de passe de la session'), '6789');
    await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

    // when
    await click(firstVisit.getByRole('checkbox', { name: 'Doe John' }));

    // then
    const secondVisit = await visitScreen('/connexion-espace-surveillant');
    await fillIn(secondVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(secondVisit.getByLabelText('Mot de passe de la session'), '6789');
    await click(secondVisit.getByRole('button', { name: 'Surveiller la session' }));
    assert.true(find('input[type="checkbox"]').checked);
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

    const firstVisit = await visitScreen('/connexion-espace-surveillant');
    await fillIn(firstVisit.getByRole('spinbutton', { name: 'Numéro de la session' }), '12345');
    await fillIn(firstVisit.getByLabelText('Mot de passe de la session'), '6789');
    await click(firstVisit.getByRole('button', { name: 'Surveiller la session' }));

    // when
    await click(firstVisit.getByRole('button', { name: 'Afficher les options du candidat' }));
    await click(firstVisit.getByRole('button', { name: 'Autoriser la reprise du test' }));
    await click(firstVisit.getByRole('button', { name: "Je confirme l'autorisation" }));

    // then
    assert.contains('Succès ! John Doe peut reprendre son test de certification.');
  });
});
