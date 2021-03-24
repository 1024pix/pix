import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import {
  createUserMembershipWithRole,
  createPrescriberByUser,
} from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team Creation', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  const email = 'user.to.invite@example.net';

  test('it should not be accessible by an unauthenticated prescriber', async function(assert) {
    // when
    await visit('/equipe/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  module('When prescriber is logged in', (hooks) => {

    let organizationId;
    let user;

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

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
        await visit('/equipe/creation');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When prescriber is an admin', (hooks) => {

      let inputLabel;
      let cancelButton;
      let inviteButton;

      hooks.beforeEach(async function() {
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        organizationId = server.db.organizations[0].id;

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });

        inputLabel = this.intl.t('pages.team-new-item.input-label');
        inviteButton = this.intl.t('pages.team-new-item.invite-button');
        cancelButton = this.intl.t('pages.team-new-item.cancel-button');
      });

      test('it should be accessible', async function(assert) {
        // when
        await visit('/equipe/creation');

        // then
        assert.equal(currentURL(), '/equipe/creation');
      });

      test('it should allow to invite a prescriber and redirect to team page', async function(assert) {
        // given
        const ariaLabelMember = this.intl.t('pages.team-items.row.aria-label');

        const code = 'ABCDEFGH01';
        server.create('user', {
          firstName: 'Gigi',
          lastName: 'La Brochette',
          email,
          pixOrgaTermsOfServiceAccepted: true,
        });

        await visit('/equipe/creation');
        await fillInByLabel(inputLabel, email);

        // when
        await clickByLabel(inviteButton);

        // then
        const organizationInvitation = server.db.organizationInvitations[server.db.organizationInvitations.length - 1];
        assert.equal(organizationInvitation.email, email);
        assert.equal(organizationInvitation.status, 'PENDING');
        assert.equal(organizationInvitation.code, code);
        assert.equal(currentURL(), '/equipe/membres');
        assert.dom(`[aria-label="${ariaLabelMember}"]`).exists({ count: 1 });
      });

      test('it should not allow to invite a prescriber when an email is not given', async function(assert) {
        // given
        await visit('/equipe/creation');
        await fillInByLabel(inputLabel, '');

        // when
        await clickByLabel(inviteButton);

        // then
        assert.equal(currentURL(), '/equipe/creation');
      });

      test('should display an empty input field after cancel and before add a team member', async function(assert) {
        // given
        await visit('/equipe/creation');
        await fillInByLabel(inputLabel, email);
        await clickByLabel(cancelButton);

        // when
        await visit('/equipe/creation');

        // then
        assert.dom('#email').hasText('');
      });

      test('it should display error on global form when error 500 is returned from backend', async function(assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.500');

        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`, {
          errors: [{
            detail: '[Object object]',
            status: '500',
            title: 'Internal Server Error',
          }],
        }, 500);
        await fillInByLabel(inputLabel, email);

        // when
        await clickByLabel(inviteButton);

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText(expectedErrorMessage);
      });

      test('it should display error on global form when error 412 is returned from backend', async function(assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.412');

        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`, {
          errors: [{
            detail: '',
            status: '412',
            title: 'Precondition Failed',
          }],
        }, 412);
        await fillInByLabel(inputLabel, email);

        // when
        await clickByLabel(inviteButton);

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText(expectedErrorMessage);
      });

      test('it should display error on global form when error 404 is returned from backend', async function(assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.404');

        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`, {
          errors: [{
            detail: '',
            status: '404',
            title: 'Not Found',
          }],
        }, 404);
        await fillInByLabel(inputLabel, email);

        // when
        await clickByLabel(inviteButton);

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText(expectedErrorMessage);
      });

      test('it should display error on global form when error 400 is returned from backend', async function(assert) {
        // given
        const expectedErrorMessage = this.intl.t('pages.team-new.errors.status.400');

        await visit('/equipe/creation');
        server.post(`/organizations/${organizationId}/invitations`, {
          errors: [{
            detail: '',
            status: '400',
            title: 'Bad Request',
          }],
        }, 400);
        await fillInByLabel(inputLabel, email);

        // when
        await clickByLabel(inviteButton);

        // then
        assert.equal(currentURL(), '/equipe/creation');
        assert.dom('[data-test-notification-message="error"]').exists();
        assert.dom('[data-test-notification-message="error"]').hasText(expectedErrorMessage);
      });
    });
  });
});
