import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserMembershipWithRole } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team Creation', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated user', async function(assert) {
    // when
    await visit('/team/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  module('When user is logged in', function() {

    let user;

    module('When user is a member', function() {

      test('it should not be accessible', async function(assert) {
        // given
        user = createUserMembershipWithRole('MEMBER');
        await authenticateSession({
          user_id: user.id,
        });

        // when
        await visit('/equipe/creation');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When user is an owner', function() {

      test('it should be accessible', async function(assert) {
        // given
        user = createUserMembershipWithRole('OWNER');
        await authenticateSession({
          user_id: user.id,
        });

        // when
        await visit('/equipe/creation');

        // then
        assert.equal(currentURL(), '/equipe/creation');
      });

      test('it should allow to add a team member and redirect to team page', async function(assert) {
        // given
        const email = 'gigi@labrochette.com';
        const addedMember = server.create('user', { firstName: 'Gigi', lastName: 'La Brochette', email, 'pixOrgaTermsOfServiceAccepted': true });
        user = createUserMembershipWithRole('OWNER');
        await authenticateSession({
          user_id: user.id,
        });

        await visit('/equipe/creation');
        await fillIn('#email', email);

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(server.db.memberships[1].userId, addedMember.id);
        assert.equal(server.db.memberships[1].organizationRole, 'MEMBER');
        assert.equal(currentURL(), '/equipe');
        assert.dom('.table tbody tr').exists({ count: 2 });
      });

      test('it should display error on global form when error 500 is returned from backend', async function(assert) {
        // given
        user = createUserMembershipWithRole('OWNER');
        await authenticateSession({
          user_id: user.id,
        });
        server.post('/organizations/:id/add-membership',
          {
            errors: [
              {
                detail: 'Une erreur est survenue',
                status: '500',
                title: 'Internal Server Error',
              }
            ]
          }, 500);
        await visit('/equipe/creation');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('.new-campaign-page__error').exists();
        assert.dom('.new-campaign-page__error').hasText('Une erreur est survenue');
      });

      test('it should display error on global form when error 421 is returned from backend', async function(assert) {
        // given
        user = createUserMembershipWithRole('OWNER');
        await authenticateSession({
          user_id: user.id,
        });
        server.post('/organizations/:id/add-membership',
          {
            errors: [
              {
                detail: '',
                status: '421',
                title: 'Precondition Failed',
              }
            ]
          }, 500);
        await visit('/equipe/creation');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('.error-zone').exists();
        assert.dom('.error-zone').hasText('Ce membre existe déjà.');
      });

      test('it should display error on global form when error 404 is returned from backend', async function(assert) {
        // given
        user = createUserMembershipWithRole('OWNER');
        await authenticateSession({
          user_id: user.id,
        });
        server.post('/organizations/:id/add-membership',
          {
            errors: [
              {
                detail: '',
                status: '404',
                title: 'Not Found',
              }
            ]
          }, 500);
        await visit('/equipe/creation');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('.error-zone').exists();
        assert.dom('.error-zone').hasText('Cet email n\'appartient à aucun utilisateur.');
      });
    });
  });
});
