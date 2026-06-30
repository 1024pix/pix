import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | terms-of-service', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user is not authenticated', function () {
    test('should redirect to login page', async function (assert) {
      // given / when
      const screen = await visit('/cgu');

      // then
      assert.ok(screen.findByRole('heading', { name: t('pages.sign-in.first-title') }));
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When user logs in and has term of service status set at requested', function () {
    test('should be redirected to terms-of-services page', async function (assert) {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        pixAppTermsOfServiceStatus: 'requested',
      });

      // when
      await authenticateByEmail(user);

      // then
      assert.strictEqual(currentURL(), '/cgu');
    });
  });

  module('When user logs in and has term of service status set at update-requested', function () {
    test('should be redirected to terms-of-services page', async function (assert) {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        pixAppTermsOfServiceStatus: 'update-requested',
      });

      // when
      await authenticateByEmail(user);

      // then
      assert.strictEqual(currentURL(), '/cgu');
    });
  });

  module('When user logs in and has term of service status set at accepted', function () {
    test('should redirect to default page', async function (assert) {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        pixAppTermsOfServiceStatus: 'accepted',
      });

      // when
      await authenticateByEmail(user);

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });

  module('When user logs in and has term of service status set at not-applicable', function () {
    test('should redirect to default page', async function (assert) {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        pixAppTermsOfServiceStatus: 'not-applicable',
      });

      // when
      await authenticateByEmail(user);

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });
});
