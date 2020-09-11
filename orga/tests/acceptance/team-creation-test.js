import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserMembershipWithRole,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team Creation', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated prescriber', async function(assert) {
    // when
    await visit('/equipe/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  module('When prescriber is logged in', function(hooks) {

    let user;
    let organizationId;

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

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
        await visit('/equipe/creation');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When prescriber is an admin', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        organizationId = server.db.organizations[0].id;

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should be accessible', async function(assert) {
        // when
        await visit('/equipe/creation');

        // then
        assert.equal(currentURL(), '/equipe/creation');
      });

      test('it should allow to invite a prescriber and redirect to team page', async function(assert) {
        // given
        const email = 'gigi@labrochette.com';
        const code = 'ABCDEFGH01';

        server.create('user', { firstName: 'Gigi', lastName: 'La Brochette', email, pixOrgaTermsOfServiceAccepted: true });

        await visit('/equipe/creation');
        await fillIn('#email', email);

        // when
        await click('button[type="submit"]');

        // then
        const organizationInvitation = server.db.organizationInvitations[server.db.organizationInvitations.length - 1];
        assert.equal(organizationInvitation.email, email);
        assert.equal(organizationInvitation.status, 'PENDING');
        assert.equal(organizationInvitation.code, code);
        assert.equal(currentURL(), '/equipe');
        assert.dom('[aria-label="Membre"]').exists({ count: 1 });
      });

      test('it should not allow to invite a prescriber when an email is not given', async function(assert) {
        // given
        await visit('/equipe/creation');
        await fillIn('#email', '');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
      });

      test('should display an empty input field after cancel and before add a team member', async function(assert) {
        // given
        const email = 'cancel&cancel.com';

        await visit('/equipe/creation');
        await fillIn('#email', email);
        await click('.button--no-color');

        // when
        await visit('/equipe/creation');

        // then
        assert.dom('#email').hasText('');
      });

      test('it should display error on global form when error 500 is returned from backend', async function(assert) {
        // given
        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '[Object object]',
                status: '500',
                title: 'Internal Server Error',
              },
            ],
          }, 500);
        await fillIn('#email', 'fake@email');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('Quelque chose s\'est mal passé. Veuillez réessayer.');
      });

      test('it should display error on global form when error 412 is returned from backend', async function(assert) {
        // given
        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '',
                status: '412',
                title: 'Precondition Failed',
              },
            ],
          }, 412);
        await fillIn('#email', 'fake@email');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('Ce membre a déjà été ajouté.');
      });

      test('it should display error on global form when error 404 is returned from backend', async function(assert) {
        // given
        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '',
                status: '404',
                title: 'Not Found',
              },
            ],
          }, 404);
        await fillIn('#email', 'fake@email');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('Cet email n\'appartient à aucun utilisateur.');
      });

      test('it should display error on global form when error 400 is returned from backend', async function(assert) {
        // given
        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`,
          {
            errors: [
              {
                detail: '',
                status: '400',
                title: 'Bad Request',
              },
            ],
          }, 400);
        await fillIn('#email', 'fake@email');

        // when
        await click('button[type="submit"]');

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText('Le format de l\'adresse e-mail est incorrect.');
      });
    });
  });
});
