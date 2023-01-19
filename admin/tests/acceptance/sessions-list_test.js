import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit, fillByLabel } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/sessions/list');

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
      await visit('/sessions/list');

      // then
      assert.strictEqual(currentURL(), '/sessions/list');
    });

    test('it should display the number of sessions with required actions', async function (assert) {
      // given
      server.createList('with-required-action-session', 10);

      // when
      const screen = await visit('/sessions/list');

      // then
      assert.strictEqual(currentURL(), '/sessions/list');
      assert.dom(screen.getByText('Sessions à traiter (10)')).exists();
    });

    module('#Pagination', function (hooks) {
      hooks.beforeEach(function () {
        server.createList('session', 15, 'finalized');
        server.createList('session', 20);
      });

      module('Default display', function () {
        test('it should display the first page of finalized sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list');

          // then
          const sessionCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionCount, 10);
          assert.dom(screen.getByText('1-10 sur 35 éléments')).exists();
        });
      });

      module('when selecting a different page', function () {
        test('it should display the second page of finalized sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(screen.getByLabelText('Aller à la page suivante'));

          // then
          const sessionCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionCount, 10);
          assert.dom(screen.getByText('11-20 sur 35 éléments')).exists();
        });
      });

      module('when selecting a different pageSize', function () {
        test('it should display all the finalized sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(screen.getByRole('button', { name: "Nombre d'élément à afficher par page" }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: '25' }));

          // then
          const sessionCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionCount, 25);
          assert.dom(screen.getByText('1-25 sur 35 éléments')).exists();
        });
      });

      module('when invalid filter value are typed in', function () {
        test('it should display an empty list', async function (assert) {
          // given
          const screen = await visit('/sessions/list');

          // when
          await fillByLabel('Filtrer les sessions avec un id', 'azere');

          //then
          assert.dom(screen.getByText('Aucun résultat')).exists();
        });
      });
    });

    module('#Filters', function () {
      module('#id', function (hooks) {
        let expectedSession;

        hooks.beforeEach(function () {
          expectedSession = server.create('session', 'finalized');
          server.createList('session', 10, 'finalized');
        });

        test('it should display the session with the ID specified in the input field', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await fillByLabel('Filtrer les sessions avec un id', expectedSession.id);

          // then
          assert.dom(screen.getByRole('link', { name: '1' })).exists();
        });
      });

      module('#certificationCenterName', function (hooks) {
        let expectedSession;

        hooks.beforeEach(function () {
          expectedSession = server.create('session', {
            certificationCenterName: 'Erdman, Bode and Walker',
            status: 'finalized',
          });
          server.createList('session', 10, 'finalized');
        });

        test('it should display the session with a certification center name alike the one specified in the field', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await fillByLabel(
            "Filtrer les sessions avec le nom d'un centre de certification",
            expectedSession.certificationCenterName.toUpperCase()
          );

          // then
          assert
            .dom(screen.getByLabelText('Informations de la session de certification 1'))
            .containsText('Erdman, Bode and Walker');
        });
      });

      module('#status', function (hooks) {
        hooks.beforeEach(function () {
          server.createList('session', 5, 'processed');
          server.createList('session', 3, 'finalized');
        });

        test('it should display the session with status as specified in the dropdown', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(
            screen.getByRole('button', {
              name: 'Filtrer les sessions en sélectionnant un statut',
            })
          );
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: 'Résultats transmis par Pix',
            })
          );

          // then
          const sessionProcessedCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionProcessedCount, 5);
        });
      });

      module('#resultsSentToPrescriberAt', function (hooks) {
        hooks.beforeEach(function () {
          server.createList('session', 5, 'withResultsSentToPrescriber', 'finalized');
          server.createList('session', 3, 'finalized');
        });

        test('it should display sessions regardless the results have been sent or not', async function (assert) {
          // when
          const screen = await visit('/sessions/list');

          // then
          const sessionCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionCount, 8);
        });

        test('it should only display sessions which results have been sent', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(
            screen.getByRole('button', {
              name: 'Filtrer les sessions par leurs résultats diffusés ou non diffusés',
            })
          );
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: 'Résultats diffusés',
            })
          );

          // then
          const sessionWithResultSentCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionWithResultSentCount, 5);
        });

        test('it should only display sessions which results have not been sent', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(
            screen.getByRole('button', {
              name: 'Filtrer les sessions par leurs résultats diffusés ou non diffusés',
            })
          );
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: 'Résultats non diffusés',
            })
          );

          // then
          const sessionCount = screen.getAllByLabelText('Informations de la session de certification', {
            exact: false,
          }).length;
          assert.strictEqual(sessionCount, 3);
        });
      });
    });
  });
});
