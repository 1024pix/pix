import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserMembershipWithRole,
  createPrescriberByUser
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When prescriber is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/equipe');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function() {

    module('When prescriber is a member', function(hooks) {

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

    module('When prescriber is an admin', function(hooks) {

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
        assert.dom('#table-members tbody tr').exists({ count: 1 });
        assert.dom('#table-members tbody tr:first-child').hasText('Cover Harry Administrateur');
      });

      test('it should list the pending team invitations', async function(assert) {
        // given
        const organizationId = server.db.organizations[0].id;
        server.create('organization-invitation', {
          organizationId,
          createdAt: new Date()
        });

        // when
        await visit('/equipe');

        // then
        assert.dom('#table-invitations tbody tr').exists({ count: 1 });
      });
    });
  });
});
