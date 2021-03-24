import { module, test } from 'qunit';
import { currentURL, visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', () => {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/list');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', (hooks) => {

    hooks.beforeEach(async () => {
      await createAuthenticateSession({ userId: 1 });
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // when
      await visit('/sessions/list');

      // then
      assert.equal(currentURL(), '/sessions/list');
    });

    test('it should display the number of sessions with required actions', async function(assert) {
      // given
      server.createList('with-required-action-session', 10);

      // when
      await visit('/sessions/list');

      // then
      assert.equal(currentURL(), '/sessions/list');
      assert.contains('Sessions à traiter (10)');
    });

    module('#Pagination', (hooks) => {

      hooks.beforeEach(() => {
        server.createList('session', 15, 'finalized');
        server.createList('session', 20);
      });

      module('Default display', () => {

        test('it should display the first page of finalized sessions', async function(assert) {
          // when
          await visit('/sessions/list');

          // then
          assert.dom('select#pageSize').hasValue('10');
          assert.dom('.table-admin tbody tr').exists({ count: 10 });
          assert.dom('div.page-navigation__current-page').hasText('1');
        });
      });

      module('when selecting a different page', () => {

        test('it should display the second page of finalized sessions', async function(assert) {
          // when
          await visit('/sessions/list');
          await click('[aria-label="Aller à la page suivante"]');

          // then
          assert.dom('select#pageSize').hasValue('10');
          assert.dom('.table-admin tbody tr').exists({ count: 10 });
          assert.dom('div.page-navigation__current-page').hasText('2');
        });
      });

      module('when selecting a different pageSize', () => {

        test('it should display all the finalized sessions', async function(assert) {
          // when
          await visit('/sessions/list');
          await fillIn('select#pageSize', '25');

          // then
          assert.dom('select#pageSize').hasValue('25');
          assert.dom('.table-admin tbody tr').exists({ count: 25 });
          assert.dom('div.page-navigation__current-page').hasText('1');
        });
      });

      module('when invalid filter value are typed in', () => {

        test('it should display an empty list', async function(assert) {
          // given
          await visit('/sessions/list');

          // when
          await fillIn('#id', 'azere');

          //then
          assert.dom('.table__empty').hasText('Aucun résultat');
        });
      });
    });

    module('#Filters', () => {

      module('#id', (hooks) => {
        let expectedSession;

        hooks.beforeEach(() => {
          expectedSession = server.create('session', 'finalized');
          server.createList('session', 10, 'finalized');
        });

        test('it should display the session with the ID specified in the input field', async function(assert) {
          // when
          await visit('/sessions/list');
          await fillIn('#id', expectedSession.id);

          // then
          assert.dom('.table-admin tbody tr').exists({ count: 1 });
        });
      });

      module('#certificationCenterName', (hooks) => {
        let expectedSession;

        hooks.beforeEach(() => {
          expectedSession = server.create('session', 'finalized');
          server.createList('session', 10, 'finalized');
        });

        test('it should display the session with a certification center name alike the one specified in the field', async function(assert) {
          // when
          await visit('/sessions/list');
          await fillIn('#certificationCenterName', expectedSession.certificationCenterName.toUpperCase());

          // then
          assert.dom('.table-admin tbody tr').exists({ count: 1 });
        });
      });

      module('#status', (hooks) => {

        hooks.beforeEach(() => {
          server.createList('session', 5, 'processed');
          server.createList('session', 3, 'finalized');
        });

        test('it should display the session with status as specified in the dropdown', async function(assert) {
          // when
          await visit('/sessions/list');
          await fillIn('select#status', 'processed');

          // then
          assert.dom('.table-admin tbody tr').exists({ count: 5 });
        });
      });

      module('#resultsSentToPrescriberAt', (hooks) => {

        hooks.beforeEach(() => {
          server.createList('session', 5, 'withResultsSentToPrescriber', 'finalized');
          server.createList('session', 3, 'finalized');
        });

        test('it should display sessions regardless the results have been sent or not', async function(assert) {
          // when
          await visit('/sessions/list');

          // then
          assert.dom('.table-admin tbody tr').exists({ count: 8 });
        });

        test('it should only display sessions which results have been sent', async function(assert) {
          // when
          await visit('/sessions/list');
          await fillIn('select#resultsSentToPrescriberAt', 'true');

          // then
          assert.dom('.table-admin tbody tr').exists({ count: 5 });
        });

        test('it should only display sessions which results have not been sent', async function(assert) {
          // when
          await visit('/sessions/list');
          await fillIn('select#resultsSentToPrescriberAt', 'false');

          // then
          assert.dom('.table-admin tbody tr').exists({ count: 3 });
        });
      });
    });
  });
});
