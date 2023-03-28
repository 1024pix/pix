import { currentURL, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | User certifications page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let userWithNoCertificates;

  hooks.beforeEach(function () {
    userWithNoCertificates = server.create('user', 'withEmail');
  });

  module('Access to the user certifications page', function () {
    test('should not be accessible when user is not connected', async function (assert) {
      // when
      await visit('/mes-certifications');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('should be accessible when user is connected', async function (assert) {
      // given
      await authenticate(userWithNoCertificates);

      // when
      await visit('/mes-certifications');

      // then
      assert.strictEqual(currentURL(), '/mes-certifications');
    });
  });

  module('Display', function () {
    test('should render the banner', async function (assert) {
      // when
      await authenticate(userWithNoCertificates);
      await visit('/mes-certifications');

      // then
      assert.dom('.navbar-desktop-header__container').exists();
    });

    test('should render a title for the page', async function (assert) {
      // when
      await authenticate(userWithNoCertificates);
      await visit('/mes-certifications');

      // then
      assert.dom('.user-certifications-page__title').exists();
    });

    test('should render the panel which contains informations about certifications of the connected user', async function (assert) {
      // when
      await authenticate(userWithNoCertificates);
      await visit('/mes-certifications');

      // then
      assert.dom('.user-certifications-panel').exists();
    });

    module('when user has no certificates', function () {
      test('should dislpay the no certificates panel', async function (assert) {
        // when
        await authenticate(userWithNoCertificates);
        await visit('/mes-certifications');

        // then
        assert.dom('.no-certification-panel').exists();
      });
    });

    module('when user has some certificates', function () {
      test('should display the user certificates', async function (assert) {
        // given
        const userWithSomeCertificates = server.create('user', 'withEmail', 'withSomeCertificates');

        // when
        await authenticate(userWithSomeCertificates);
        await visit('/mes-certifications');

        // then
        assert.strictEqual(
          findAll('.certifications-list__table-body .certifications-list-item').length,
          userWithSomeCertificates.certifications.length
        );
      });
    });
  });
});
