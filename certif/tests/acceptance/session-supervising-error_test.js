import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session supervising error', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Aude',
      lastName: 'Hébussavabien',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [],
    });
    await authenticateSession(certificationPointOfContact.id);
  });

  module('When the supervisor tries to access a session he doesnt have a supervisor-access to', function () {
    test('it should display an error page and a HTTP 401 error', async function (assert) {
      // given
      this.sessionForSupervising = server.create('session-for-supervising', {
        id: 2000,
      });
      this.secondSession = server.create('session', {
        id: 2001,
      });
      this.server.get('/sessions/2001/supervising', { errors: [{ code: 403 }] }, 403);

      const screen = await visitScreen('/connexion-espace-surveillant');
      await fillIn(screen.getByRole('spinbutton', { name: 'Numéro de la session' }), '2000');
      await fillIn(screen.getByLabelText('Mot de passe de la session Exemple : C-12345'), '6789');
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // when
      const secondScreen = await visitScreen('/sessions/2001/surveiller');
      // then
      assert.dom(secondScreen.getByRole('heading', { name: 'Une erreur est survenue' })).exists();
      assert
        .dom(
          secondScreen.getByText(
            'Pour accéder à cette session, cliquez sur le bouton "Surveiller une session" et renseignez les informations de la session',
          ),
        )
        .exists();
      assert.dom(secondScreen.getByRole('link', { name: 'Surveiller une session' })).exists();
    });
  });
});
