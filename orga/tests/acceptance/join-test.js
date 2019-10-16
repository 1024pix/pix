import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | join', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Login', function() {

    module('When user is not logged in', function() {

      test('it should remain on join page', async function(assert) {
        // given
        const code = 'ABCDEFGH01';
        const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        const organizationInvitationId = server.create('organizationInvitation', {
          organizationId, email: 'random@email.com', status: 'pending', code
        }).id;

        // when
        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);

        // then
        assert.equal(currentURL(), `/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
      });
    });

    module('When user is logging in but has not accepted terms of service yet', function(hooks) {

      let user;
      let organizationInvitationId;
      let code;

      hooks.beforeEach(() => {
        user = createUserWithMembership();
        code = 'ABCDEFGH01';
        const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        organizationInvitationId = server.create('organizationInvitation', {
          organizationId, email: 'random@email.com', status: 'pending', code
        }).id;
      });

      test('it should redirect user to the terms-of-service page', async function(assert) {
        // given
        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await click('#login');
        await fillIn('#login-email', user.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then
        assert.equal(currentURL(), '/cgu');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should not show menu nor top bar', async function(assert) {
        // given
        server.create('campaign');

        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await click('#login');
        await fillIn('#login-email', user.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

        assert.dom('.app__sidebar').doesNotExist();
        assert.dom('.main-content__topbar').doesNotExist();
      });
    });

    module('When user is logging in and has accepted terms of service', function(hooks) {
      let user;
      let organizationInvitationId;
      let code;

      hooks.beforeEach(() => {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        code = 'ABCDEFGH01';
        const organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        organizationInvitationId = server.create('organizationInvitation', {
          organizationId, email: 'random@email.com', status: 'pending', code
        }).id;
      });

      test('it should redirect user to the campaigns list', async function(assert) {
        // given
        server.create('campaign');

        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await click('#login');
        await fillIn('#login-email', user.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then
        assert.equal(currentURL(), '/campagnes');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should show user name', async function(assert) {
        // given
        server.create('campaign');

        await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
        await click('#login');
        await fillIn('#login-email', user.email);
        await fillIn('#login-password', 'secret');

        // when
        await click('button[type=submit]');

        // then
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

        assert.dom('.topbar__user-identification').hasText('Harry Cover');
      });
    });
  });

  module('Register', function() {

    module('When user is registering', function() {

      module('When a pending organization-invitation already exists', function(hooks) {

        let organizationId;

        hooks.beforeEach(() => {
          organizationId = server.create('organization', { name: 'College BRO & Evil Associates' }).id;
        });

        test('it should accept invitation and redirect user to the terms-of-service page', async function(assert) {
          // given
          const code = 'ABCDEFGH01';
          const organizationInvitationId = server.create('organizationInvitation', {
            organizationId, email: 'random@email.com', status: 'pending', code
          }).id;

          await visit(`/rejoindre?invitationId=${organizationInvitationId}&code=${code}`);
          await fillIn('#register-firstName', 'pix');
          await fillIn('#register-lastName', 'pix');
          await fillIn('#register-email', 'shi@fu.me');
          await fillIn('#register-password', 'Password4register');
          await click('#register-cgu');

          // when
          await click('button[type=submit]');

          // then
          assert.equal(currentURL(), '/cgu');
          assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
          const organizationInvitation = server.db.organizationInvitations[0];
          assert.equal(organizationInvitation.status, 'accepted');
        });
      });
    });
  });
});
