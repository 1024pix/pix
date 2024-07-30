import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | authenticated/users | list', function (hooks) {
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
          assert
            .dom(screen.getByLabelText("Informations de l'utilisateur Victor MacBernik"))
            .hasText('123 Victor MacBernik victor@famille-pirate.net victor123');
          assert.strictEqual(screen.queryAllByLabelText("Informations de l'utilisateur", { exact: false }).length, 1);
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
          assert
            .dom(screen.getByLabelText("Informations de l'utilisateur Alex Ception"))
            .hasText('1 Alex Ception alex.ception@example.net alex.pix1030');
        });
      });

      module('when clicking on "Vider" button', function () {
        test('should empty url params', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit('/users/list?firstName=emma&lastName=sardine&email=emma@example.net');
          await click(screen.getByRole('button', { name: 'Vider les champs de recherche' }));

          // then
          assert.strictEqual(currentURL(), '/users/list');
        });

        test('should empty all search fields', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          server.create('user', {
            firstName: 'emma',
            lastName: 'sardine',
            email: 'emma@example.net',
            identifiant: 'emma123',
          });
          const screen = await visit('/users/list');
          await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'sardine');
          await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'emma@example.net');
          await fillIn(screen.getByRole('textbox', { name: 'Identifiant' }), 'emma123');

          // when
          await click(screen.getByRole('button', { name: 'Vider les champs de recherche' }));

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Prénom' })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: 'Identifiant' })).hasNoValue();
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
          await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'sardine');
          await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'emma@example.net');
          await fillIn(screen.getByRole('textbox', { name: 'Identifiant' }), 'emma123');

          // when
          await click(screen.getByRole('button', { name: 'Vider les champs de recherche' }));
          await click(screen.getByRole('button', { name: 'Charger' }));

          // then
          assert.strictEqual(currentURL(), '/users/list');
          assert.dom(screen.getByRole('textbox', { name: 'Prénom' })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).hasNoValue();
          assert.dom(screen.getByRole('textbox', { name: 'Identifiant' })).hasNoValue();
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
