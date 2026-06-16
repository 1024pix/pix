import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
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

  module('When user log in and must validate Pix latest terms of service', function () {
    test('should be redirected to terms-of-services page', async function (assert) {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        mustValidateTermsOfService: true,
        lastTermsOfServiceValidatedAt: new Date(),
      });

      // when
      await authenticateByEmail(user);

      // then
      assert.strictEqual(currentURL(), '/cgu');
    });
  });

  module('when the user has validated terms of service', function () {
    test('should redirect to default page when user validate the terms of service', async function (assert) {
      // given
      const user = server.create('user', {
        email: 'with-email',
        password: 'pix123',
        cgu: true,
        mustValidateTermsOfService: true,
        lastTermsOfServiceValidatedAt: new Date(),
      });
      await authenticateByEmail(user);

      // when
      await clickByLabel(t('pages.terms-of-service.actions.accept'));

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });
});
