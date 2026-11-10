import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
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
      const screen = await visit(`/parcours/${combinedCourse.code}/landing`);
      await click(screen.getByRole('button', { name: t('pages.campaign-landing.login.login-cta') }));

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
      const screen = await visit(`/parcours/${combinedCourse.code}/landing`);

      await click(screen.getByRole('button', { name: t('pages.campaign-landing.login.signup-cta') }));

      // then
      assert.strictEqual(currentURL(), '/inscription');
    });
  });
  module('when user is connected', function (hooks) {
    hooks.beforeEach(async function () {
      const prescritUser = server.create('user', 'withEmail', {
        pixAppTermsOfServiceStatus: 'accepted',
      });

      await authenticate(prescritUser);
    });

    test('when the user clicks on CTA, should redirect to presentation page', async function (assert) {
      // given
      const combinedCourse = server.create('combined-course', {
        code: 'COMBINIX',
      });

      // when
      const screen = await visit(`/parcours/${combinedCourse.code}/landing`);
      await click(screen.getByRole('button', { name: t('pages.campaign-landing.login.start-cta') }));

      // then
      assert.strictEqual(currentURL(), `/parcours/${combinedCourse.code}`);
    });
  });
});
