import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn } from '@ember/test-helpers';
import { visit as visitScreen } from '@pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session supervising', function(hooks) {

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
  });

  module('When there are candidates on the session', function() {
    test('it should display candidates entries', async function(assert) {
      // given
      const sessionId = 12345;
      this.sessionForSupervising = server.create('session-for-supervising', {
        id: sessionId,
        certificationCandidates: [
          server.create('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'Toto',
            lastName: 'Tutu',
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
      assert.dom(screen.getByRole('checkbox', { name: 'Tutu Toto' })).exists();
      assert.dom(screen.getByRole('checkbox', { name: 'Lord Star' })).exists();
    });
  });
});
