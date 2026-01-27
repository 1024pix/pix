import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';
import { setupMirage } from '../test-support/setup-mirage';

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

  module('When the invigilator tries to access a session he doesnt have a invigilator-access to', function () {
    test('it should display an error page and a HTTP 401 error', async function (assert) {
      // given
      this.sessionForSupervising = server.create('session-for-supervising', {
        id: 2000,
      });
      this.secondSession = server.create('session-management', {
        id: 2001,
      });
      this.server.get('/sessions/2001/supervising', { errors: [{ code: 403 }] }, 403);

      const screen = await visitScreen('/connexion-espace-surveillant');
      await fillIn(
        screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }),
        '2000',
      );
      await fillIn(
        screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }),
        '6789',
      );
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
