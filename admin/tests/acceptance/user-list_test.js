import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | User List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/users/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/users/list');

      // then
      assert.strictEqual(currentURL(), '/users/list');
    });

    test('it should not list the users at loading page', async function (assert) {
      // when
      const screen = await visit('/users/list');

      // then
      assert.dom(screen.getByText('Aucun résultat')).exists();
    });

    module('when users are filtered', function () {
      module('when user has only username or email', function () {
        test('it should display the current user', async function (assert) {
          // given
          const result = {
            data: [
              {
                type: 'users',
                id: '1',
                attributes: {
                  'first-name': 'Alex',
                  'last-name': 'Ception',
                  username: 'alex.pix1030',
                },
              },
            ],
          };

          this.server.get('/admin/users', () => result);

          // when
          const screen = await visit('/users/list?username=alex.pix1030');

          // then
          assert
            .dom(screen.getByLabelText("Informations de l'utilisateur Alex Ception"))
            .hasText('1 Alex Ception alex.pix1030');
          assert.strictEqual(screen.queryAllByLabelText("Informations de l'utilisateur", { exact: false }).length, 1);
        });
      });
      module('when user has username and email', function () {
        test('it should display the current user', async function (assert) {
          // given
          const result = {
            data: [
              {
                type: 'users',
                id: '1',
                attributes: {
                  'first-name': 'Alex',
                  'last-name': 'Ception',
                  email: 'alex.ception@example.net',
                  username: 'alex.pix1030',
                },
              },
            ],
          };

          this.server.get('/admin/users', () => result);

          // when
          const screen = await visit('/users/list?username=alex.pix1030');

          // then
          assert
            .dom(screen.getByLabelText("Informations de l'utilisateur Alex Ception"))
            .hasText('1 Alex Ception alex.ception@example.net alex.pix1030');
        });
      });
    });
  });
});
