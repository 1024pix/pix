import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';
import { setupMirage } from '../test-support/setup-mirage';

module('Acceptance | Invigilator Portal', function (hooks) {
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

    server.create('session-for-supervising', { id: '12345' });
  });

  module('When invigilator authentication is successful', function () {
    test('it should redirect to supervising page', async function (assert) {
      // given
      const screen = await visitScreen('/connexion-espace-surveillant');
      await fillIn(
        screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }),
        '12345',
      );
      await fillIn(
        screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }),
        '6789',
      );

      // when
      await click(screen.getByRole('button', { name: 'Surveiller la session' }));

      // then
      assert.strictEqual(currentURL(), '/sessions/12345/surveiller');
    });
  });

  module('When invigilator is supervising a session', function () {
    module('When quit button is clicked', function () {
      module('When action is confirmed through the modal', function () {
        test('it should redirect to the invigilator authentication page', async function (assert) {
          // given
          const screen = await visitScreen('/connexion-espace-surveillant');
          await fillIn(
            screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }),
            '12345',
          );
          await fillIn(
            screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }),
            '6789',
          );
          await click(screen.getByRole('button', { name: 'Surveiller la session' }));

          // when
          await click(screen.getByText('Quitter'));

          await click(screen.getByText('Quitter la surveillance'));

          // then
          assert.strictEqual(currentURL(), '/connexion-espace-surveillant');
        });
      });
    });
  });
});
