import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl, { t } from '../../../helpers/setup-intl';

module('Acceptance | authenticated/users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

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

    test('it should set users menubar item active', async function (assert) {
      // when
      const screen = await visit('/users/list');

      // then
      assert.dom(screen.getByRole('link', { name: 'Utilisateurs' })).hasClass('active');
    });

    test('it should not list the users at loading page', async function (assert) {
      // when
      const screen = await visit('/users/list');

      // then
      assert.dom(screen.getByText('Aucun résultat')).exists();
    });

    module('when users are filtered', function () {
      module('when filtering on user id', function () {
        test('it displays the current user', async function (assert) {
          // given
          const result = {
            meta: {
              page: 1,
              pageSize: 5,
              rowCount: 5,
              pageCount: 1,
            },
            data: [
              {
                type: 'users',
                id: '123',
                attributes: {
                  'first-name': 'Victor',
                  'last-name': 'MacBernik',
                  email: 'victor@famille-pirate.net',
                  username: 'victor123',
                },
              },
            ],
          };

          this.server.get('/admin/users', () => result);

          // when
          const screen = await visit('/users/list?id=123');

          // then
          const table = screen.getByRole('table', { name: t('components.users.list-items.table.caption') });
          assert
            .dom(within(table).getByRole('row', { name: '123 Victor MacBernik victor@famille-pirate.net victor123' }))
            .exists();
        });
      });

      module('when user has only username or email', function () {
        test('it should display the current user', async function (assert) {
          // given
          const result = {
            meta: {
              page: 1,
              pageSize: 5,
              rowCount: 5,
              pageCount: 1,
            },
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
          const table = screen.getByRole('table', { name: t('components.users.list-items.table.caption') });
          assert.dom(within(table).getByRole('row', { name: '1 Alex Ception alex.pix1030' })).exists();
        });
      });

      module('when user has username and email', function () {
        test('it should display the current user', async function (assert) {
          // given
          const result = {
            meta: {
              page: 1,
              pageSize: 5,
              rowCount: 5,
              pageCount: 1,
            },
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
          const table = screen.getByRole('table', { name: t('components.users.list-items.table.caption') });
          assert
            .dom(within(table).getByRole('row', { name: '1 Alex Ception alex.ception@example.net alex.pix1030' }))
            .exists();
        });
      });

      module('when clicking on "Vider" button', function () {
        test('should empty url params', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit('/users/list?firstName=emma&lastName=sardine&email=emma@example.net');
          await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));

          // then
          assert.strictEqual(currentURL(), '/users/list');
        });

        test('empties all search fields and resets query type to "Contains"', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          server.create('user', {
            firstName: 'emma',
            lastName: 'sardine',
            email: 'emma@example.net',
            identifiant: 'emma123',
          });
          const screen = await visit('/users/list');

          await click(screen.getByRole('button', { name: t('common.filters.common.selector') }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: t('pages.users-list.query.exact') }));
          await fillIn(screen.getByRole('textbox', { name: t('common.filters.users.lastname') }), 'sardine');
          await fillIn(screen.getByRole('textbox', { name: t('common.filters.users.email') }), 'emma@example.net');
          await fillIn(screen.getByRole('textbox', { name: t('common.filters.users.username') }), 'emma123');

          // when
          await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));

          // then
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.firstname') })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.lastname') })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.email') })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.username') })).hasNoValue();

          await click(screen.getByRole('button', { name: t('common.filters.common.selector') }));
          await screen.findByRole('listbox');

          assert.ok(screen.getByRole('option', { name: t('pages.users-list.query.contains'), selected: true }));
          assert.ok(screen.getByRole('option', { name: t('pages.users-list.query.exact'), selected: false }));
        });

        test('should let empty fields on search', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          server.create('user', {
            firstName: 'emma',
            lastName: 'sardine',
            email: 'emma@example.net',
            identifiant: 'emma123',
          });
          const screen = await visit('/users/list');
          await fillIn(screen.getByRole('textbox', { name: t('common.filters.users.lastname') }), 'sardine');
          await fillIn(screen.getByRole('textbox', { name: t('common.filters.users.email') }), 'emma@example.net');
          await fillIn(screen.getByRole('textbox', { name: t('common.filters.users.username') }), 'emma123');

          // when
          await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));
          await click(screen.getByRole('button', { name: t('common.filters.actions.load') }));

          // then
          assert.strictEqual(currentURL(), '/users/list');
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.firstname') })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.lastname') })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.email') })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: t('common.filters.users.username') })).hasNoValue();
        });
      });
    });

    test('should access on user details page by user search form', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const usersListAfterFilteredSearch = {
        data: [
          {
            type: 'users',
            id: '1',
            attributes: {
              'first-name': 'Pix',
              'last-name': 'Aile',
              email: 'userpix1@example.net',
            },
          },
        ],
      };

      this.server.get('/users', () => usersListAfterFilteredSearch);

      // when
      const screen = await visit('/users/list?email=userpix1example.net');
      await click(screen.getByRole('link', { name: '1' }));

      // then
      assert.strictEqual(currentURL(), `/users/1`);
    });
  });
});
