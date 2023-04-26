import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | terms-of-service', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

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
      const screen = await authenticateByEmail(user);

      // when
      await click(screen.getByRole('checkbox', { name: "J'accepte les conditions d'utilisation de Pix" }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.terms-of-service.form.button') }));

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });
});
