import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';
import { setupMirage } from '../test-support/setup-mirage';

module('Acceptance | Login session invigilator', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Lara',
      lastName: 'Pafromage',
      email: 'lara.pafromage@example.com',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [],
    });
    await authenticateSession(certificationPointOfContact.id);

    server.create('session-for-supervising', { id: '12345' });
  });

  test('should display current user email and a change account button', async function (assert) {
    // given
    const screen = await visitScreen('/connexion-espace-surveillant');

    // then
    assert.dom(screen.getByText('lara.pafromage@example.com')).exists();
    assert.dom(screen.getByText(t('pages.session-supervising.login.form.actions.switch-account'))).exists();
  });

  module('When invigilator wants to change account', function () {
    test('it should redirect to logout page', async function (assert) {
      // given
      const screen = await visitScreen('/connexion-espace-surveillant');

      // when
      await click(screen.getByRole('link', { name: t('pages.session-supervising.login.form.actions.switch-account') }));

      // then
      assert.strictEqual(currentURL(), '/logout');
    });
  });
});
