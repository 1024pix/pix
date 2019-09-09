import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserMembershipWithRole } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/equipe');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function() {

    module('When user is a member', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('MEMBER');

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

    module('When user is an owner', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('OWNER');

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should be accessible', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.equal(currentURL(), '/equipe');
      });

      test('it should show title of team page', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.dom('.page-title').hasText('Mon équipe');
      });

      test('it should list the team members', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.dom('.table tbody tr').exists({ count: 1 });
      });
    });
  });
});
