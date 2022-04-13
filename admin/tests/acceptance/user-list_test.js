import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | User List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/users/list');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/users/list');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/users/list');
    });

    test('it should not list the users at loading page', async function (assert) {
      // when
      const screen = await visit('/users/list');

      // then
      assert.dom(screen.getByText('Aucun résultat')).exists();
    });

    test('it should display the current filter when users are filtered', async function (assert) {
      // given
      const result = {
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

      this.server.get('/users', () => result);

      // when
      const screen = await visit('/users/list?email=example.net');

      // then
      assert.dom(screen.getByLabelText("Informations de l'utilisateur Pix Aile")).containsText('userpix1@example.net');
      assert.strictEqual(screen.queryAllByLabelText("Informations de l'utilisateur", { exact: false }).length, 1);
    });
  });
});
