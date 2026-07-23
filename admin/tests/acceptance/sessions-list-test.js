import { fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Session List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

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
      server.createList('with-required-action-session', 10, { version: 3 });

      // when
      const screen = await visit('/sessions/list');

      // then
      assert.strictEqual(currentURL(), '/sessions/list');
      assert.dom(screen.getByText(`${t('pages.sessions.list.required-actions.v3')} (10)`)).exists();
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
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 36);
          assert.dom(screen.getByText('35 éléments')).exists();
        });
      });

      module('when selecting a different page', function () {
        test('it should display the second page of finalized sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list?pageSize=10');
          await click(screen.getByRole('button', { name: /Aller à la page suivante/ }));

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 11);
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
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 26);
          assert.dom(screen.getByText('1-25 sur 35 éléments')).exists();
        });
      });

      module('when the ids filter contains no valid id', function () {
        test('it should not filter the sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list?ids=azere');

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 36);
        });
      });
    });

    module('#Filters', function () {
      module('#ids', function (hooks) {
        let firstExpectedSession;
        let secondExpectedSession;

        hooks.beforeEach(function () {
          firstExpectedSession = server.create('session', 'finalized');
          secondExpectedSession = server.create('session', 'finalized');
          server.createList('session', 10, 'finalized');
        });

        module('when only one ID is specified in the dedicated filter', function () {
          test('it should display the expected session', async function (assert) {
            // when
            const screen = await visit('/sessions/list');
            await fillByLabel(t('pages.sessions.list.filters.ids.aria-label'), firstExpectedSession.id);

            // then
            const table = screen.getByRole('table', {
              name: t('pages.sessions.table.caption'),
            });
            const rows = within(table).getAllByRole('row');
            assert.strictEqual(rows.length, 2);
            assert.dom(screen.getByRole('link', { name: firstExpectedSession.id })).exists();
          });
        });

        module('when multiple IDs are specified in the dedicated filter', function () {
          test('it should display the expected sessions', async function (assert) {
            // when
            const screen = await visit('/sessions/list');
            await fillByLabel(
              t('pages.sessions.list.filters.ids.aria-label'),
              `${firstExpectedSession.id}, ${secondExpectedSession.id}`,
            );

            // then
            const table = screen.getByRole('table', {
              name: t('pages.sessions.table.caption'),
            });
            const rows = within(table).getAllByRole('row');
            assert.strictEqual(rows.length, 3);
            assert.dom(screen.getByRole('link', { name: firstExpectedSession.id })).exists();
            assert.dom(screen.getByRole('link', { name: secondExpectedSession.id })).exists();
          });
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
            expectedSession.certificationCenterName.toUpperCase(),
          );

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.dom(rows[1]).containsText('Erdman, Bode and Walker');
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
              name: t('pages.sessions.table.headers.status'),
            }),
          );
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: 'Résultats transmis par Pix',
            }),
          );

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 6);
        });
      });

      module('#version', function (hooks) {
        hooks.beforeEach(function () {
          server.createList('session', 5, { version: 2 });
          server.createList('session', 3, { version: 3 });
        });

        test('it should display sessions regardless of the version', async function (assert) {
          // when
          const screen = await visit('/sessions/list');

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 9);
        });

        test('it should only display V2 sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(
            screen.getByRole('button', {
              name: t('pages.sessions.list.filters.version.label'),
            }),
          );
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: 'Sessions V2',
            }),
          );

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 6);
        });

        test('it should only display V3 sessions', async function (assert) {
          // when
          const screen = await visit('/sessions/list');
          await click(
            screen.getByRole('button', {
              name: t('pages.sessions.list.filters.version.label'),
            }),
          );
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', {
              name: 'Sessions V3',
            }),
          );

          // then
          const table = screen.getByRole('table', {
            name: t('pages.sessions.table.caption'),
          });
          const rows = within(table).getAllByRole('row');
          assert.strictEqual(rows.length, 4);
        });
      });
    });
  });
});
