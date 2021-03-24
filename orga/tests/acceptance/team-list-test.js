import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserMembershipWithRole,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import times from 'lodash/times';

module('Acceptance | Team List', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When prescriber is not logged in', () => {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/equipe');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', () => {

    module('When prescriber is a member', (hooks) => {

      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should not be accessible', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When prescriber is an admin', (hooks) => {

      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should be accessible', async function(assert) {
        // when
        await visit('/equipe/membres');

        // then
        assert.equal(currentURL(), '/equipe/membres');
      });

      test('it should show title of team page', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.dom('.page-title').hasText('Mon équipe');
      });
    });
  });

  module('When the prescriber comes back to this route', (hooks) => {

    hooks.beforeEach(async () => {
      user = createUserMembershipWithRole('ADMIN');
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should land on first page', async (assert) => {
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
      await clickByLabel('Équipe');

      // then
      assert.equal(currentURL(), '/equipe/membres');
    });
  });
});
