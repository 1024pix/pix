import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createUserMembershipWithRole, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import times from 'lodash/times';

module('Acceptance | Team List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/equipe');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    module('When prescriber is a member', function (hooks) {
      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('it should not be accessible', async function (assert) {
        // when
        await visit('/equipe');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When prescriber is an admin', function (hooks) {
      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('it should be accessible', async function (assert) {
        // when
        await visit('/equipe/membres');

        // then
        assert.equal(currentURL(), '/equipe/membres');
      });

      test('it should show title of team page', async function (assert) {
        // when
        await visit('/equipe');

        // then
        assert.dom('.page-title').hasText('Mon équipe');
      });
    });
  });

  module('When the prescriber comes back to this route', function (hooks) {
    hooks.beforeEach(async () => {
      user = createUserMembershipWithRole('ADMIN');
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('it should land on first page', async function (assert) {
      // given
      const organizationId = server.db.organizations[0].id;
      times(10, () => {
        server.create('membership', {
          organizationId,
          createdAt: new Date(),
        });
      });
      await visit('/equipe/membres?pageNumber=2');
      await visit('/campagnes');

      // when
      await clickByName('Équipe');

      // then
      assert.equal(currentURL(), '/equipe/membres');
    });
  });
});
