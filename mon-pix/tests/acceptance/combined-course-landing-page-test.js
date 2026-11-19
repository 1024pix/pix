import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | CombinedCourse | combined-course-landing-page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('when user is not connected', function () {
    test('when the user clicks on login CTA, it should redirect to login page', async function (assert) {
      // given
      const combinedCourse = server.create('combined-course', {
        code: 'COMBINIX',
      });

      // when
      const screen = await visit(`/parcours/${combinedCourse.code}`);
      await click(screen.getByRole('button', { name: t('pages.campaign-landing.actions.login-cta') }));

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('when the user clicks on signup CTA, should redirect to sign-up page', async function (assert) {
      // given
      server.create('verified-code', {
        id: 'COMBINIX',
        type: 'combined-course',
      });

      const combinedCourse = server.create('combined-course', {
        code: 'COMBINIX',
      });

      // when
      const screen = await visit(`/parcours/${combinedCourse.code}`);

      await click(screen.getByRole('button', { name: t('pages.campaign-landing.actions.signup-cta') }));

      // then
      assert.strictEqual(currentURL(), '/inscription');
    });

    test('it should stay on the landing page when accessing its URL directly', async function (assert) {
      // given
      server.create('combined-course', { code: 'COMBINIX' });

      // when
      const screen = await visit('/parcours/COMBINIX/presentation');

      // then
      assert.strictEqual(currentURL(), '/parcours/COMBINIX/presentation');
      assert.dom(screen.getByRole('button', { name: t('pages.campaign-landing.actions.login-cta') })).exists();
    });
  });
  module('when user is connected', function (hooks) {
    hooks.beforeEach(async function () {
      const prescritUser = server.create('user', 'withEmail', {
        pixAppTermsOfServiceStatus: 'accepted',
      });

      await authenticate(prescritUser);
    });

    module('when user has no participation to combined course yet', function () {
      test('when the user clicks on CTA, should redirect to presentation page', async function (assert) {
        // given
        const combinedCourse = server.create('combined-course', {
          code: 'COMBINIX',
          status: 'NOT_STARTED',
        });

        // when
        const screen = await visit(`/parcours/${combinedCourse.code}`);
        await click(screen.getByRole('button', { name: t('pages.campaign-landing.actions.start-cta') }));

        // then
        assert.strictEqual(currentURL(), `/parcours/${combinedCourse.code}/sommaire`);
      });

      test('it should stay on the landing page when accessing its URL directly', async function (assert) {
        // given
        server.create('combined-course', { code: 'COMBINIX', status: 'NOT_STARTED' });

        // when
        const screen = await visit('/parcours/COMBINIX/presentation');

        // then
        assert.strictEqual(currentURL(), '/parcours/COMBINIX/presentation');
        assert.dom(screen.getByRole('button', { name: t('pages.campaign-landing.actions.start-cta') })).exists();
      });
    });
    module('when user has a participation to combined course', function () {
      test('the user should be redirected to presentation page', async function (assert) {
        // given
        const combinedCourse = server.create('combined-course', {
          code: 'COMBINIX',
          status: 'STARTED',
        });

        // when
        await visit(`/parcours/${combinedCourse.code}`);

        // then
        assert.strictEqual(currentURL(), `/parcours/${combinedCourse.code}/sommaire`);
      });

      test('it should be redirected to the sommaire page when accessing the landing page URL directly', async function (assert) {
        // given
        server.create('combined-course', { code: 'COMBINIX', status: 'STARTED' });

        // when
        await visit('/parcours/COMBINIX/presentation');

        // then
        assert.strictEqual(currentURL(), '/parcours/COMBINIX/sommaire');
      });
    });
  });
});
