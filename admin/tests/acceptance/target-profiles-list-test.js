import { module, test } from 'qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Target Profiles List', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', () => {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/target-profiles/list');

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
      await visit('/target-profiles/list');

      // then
      assert.equal(currentURL(), '/target-profiles/list');
    });

    test('it should list target profiles', async function(assert) {
      // given
      server.createList('target-profile', 12);

      // when
      await visit('/target-profiles/list');

      // then
      assert.dom('[aria-label="Profil cible"]').exists({ count: 12 });
    });

    module('when filters are used', (hooks) => {

      hooks.beforeEach(async () => {
        server.createList('target-profile', 12);
      });

      test('it should display the current filter when target profiles are filtered by name', async function(assert) {
        // when
        await visit('/target-profiles/list?name=sav');

        // then
        assert.dom('input#name').hasValue('sav');
      });

      test('it should display the current filter when target profiles are filtered by id', async function(assert) {
        // when
        await visit('/target-profiles/list?id=123');

        // then
        assert.dom('input#id').hasValue('123');
      });
    });

    test('it should redirect to target profile details on click', async function(assert) {
      // given
      server.create('target-profile', { id: 1 });
      await visit('/target-profiles/list');

      // when
      await click('[aria-label="Profil cible"]');

      // then
      assert.equal(currentURL(), '/target-profiles/1');
    });
  });
});
