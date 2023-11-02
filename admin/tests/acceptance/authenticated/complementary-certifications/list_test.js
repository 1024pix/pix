import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Complementary certifications | list ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/complementary-certifications/list');

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
      await visit('/complementary-certifications/');

      // then
      assert.strictEqual(currentURL(), '/complementary-certifications/list');
    });

    test('it should set complementary certifications menubar item active', async function (assert) {
      // when
      const screen = await visit('/complementary-certifications/list');

      // then
      assert.dom(screen.getByRole('link', { name: 'Certifications complémentaires' })).hasClass('active');
    });

    test('it should render the complementary certifications list', async function (assert) {
      // given
      server.create('complementary-certification', { id: 1, key: 'AN', label: 'TOINE' });

      // when
      const screen = await visit('/complementary-certifications/list');

      // then
      assert.dom(screen.getByText('ID')).exists({ count: 1 });
      assert.dom(screen.getByText('1')).exists({ count: 1 });

      assert.dom(screen.getByText('Nom')).exists({ count: 1 });
      assert.dom(screen.getByText('TOINE')).exists({ count: 1 });
    });

    test('it should redirect to complementary certification details on click ', async function (assert) {
      // given
      server.create('complementary-certification', {
        id: 1,
        key: 'AN',
        label: 'TOINE',
        targetProfilesHistory: [
          {
            id: 52,
            name: 'Stephen target',
            badges: [],
          },
        ],
      });
      const screen = await visit('/complementary-certifications/list');

      // when
      await click(screen.getByRole('link', { name: 'TOINE' }));

      // then
      assert.strictEqual(currentURL(), '/complementary-certifications/1/details');
    });
  });
});
