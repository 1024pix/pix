import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification frameworks | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/certification-frameworks');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/certification-frameworks');

      // then
      assert.strictEqual(currentURL(), '/certification-frameworks');
    });

    test('it should set certification frameworks menubar item active', async function (assert) {
      // when
      const screen = await visit('/certification-frameworks');

      // then
      assert.dom(screen.getByRole('link', { name: 'Référentiels de certification' })).hasClass('active');
    });

    test('it should render the certification frameworks list', async function (assert) {
      // given
      server.create('certification-framework', { id: 'DROIT' });
      server.create('complementary-certification', { id: 1, key: 'DROIT' });

      // when
      const screen = await visit('/certification-frameworks');

      // then
      assert.dom(screen.getByText(t('components.certification-frameworks.list.name'))).exists({ count: 1 });
      assert
        .dom(screen.getByRole('link', { name: t('components.certification-frameworks.labels.DROIT') }))
        .exists({ count: 1 });
      assert
        .dom(screen.getByText(t('components.certification-frameworks.list.active-version-start-date')))
        .exists({ count: 1 });
    });

    test('it should redirect to the certification framework details on click', async function (assert) {
      // given
      server.create('certification-framework', { id: 'CORE' });
      server.create('framework-history', {
        id: 'CORE',
        history: [],
      });

      const screen = await visit('/certification-frameworks');

      // when
      await click(screen.getByRole('link', { name: t('components.certification-frameworks.labels.CORE') }));

      // then
      assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
    });
  });
});
