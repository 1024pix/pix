import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  currentSession
} from 'ember-simple-auth/test-support';
import {
  createUserMembershipWithRole,
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserManagingStudents,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should redirect user to login page', async function(assert) {
      // when
      await visit('/');

      // then
      assert.equal(currentURL(), '/connexion');
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module('When prescriber is already logged in', function(hooks) {

    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should redirect prescriber to campaign list page', async function(assert) {
      // when
      await visit('/connexion');

      // then
      assert.equal(currentURL(), '/campagnes');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module('When prescriber is logging in but has not accepted terms of service yet', function(hooks) {

    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembership();
      createPrescriberByUser(user);
    });

    test('it should redirect prescriber to the terms-of-service page', async function(assert) {
      // given
      await visit('/connexion');
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

      await visit('/connexion');
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

    hooks.beforeEach(() => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);
    });

    test('it should redirect user to the campaigns list', async function(assert) {
      // given
      server.create('campaign');

      await visit('/connexion');
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

      await visit('/connexion');
      await fillIn('#login-email', user.email);
      await fillIn('#login-password', 'secret');

      // when
      await click('button[type=submit]');

      // then
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

      assert.dom('.logged-user-summary__name').hasText('Harry Cover');
    });
  });

  module('When prescriber is already authenticated', function() {

    module('When prescriber has already accepted terms of service', function(hooks) {

      hooks.beforeEach(async () => {
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should let prescriber access requested page', async function(assert) {
        // when
        await visit('/campagnes/creation');

        // then
        assert.equal(currentURL(), '/campagnes/creation');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should display the organization linked to the connected prescriber', async function(assert) {
        // when
        await visit('/');

        // then
        assert.dom('.logged-user-summary__organization').hasText('BRO & Evil Associates (EXTBRO)');
      });

      test('it should redirect prescriber to the campaigns list on root url', async function(assert) {
        // when
        await visit('/');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When prescriber is admin', function(hooks) {

      hooks.beforeEach(async () => {
        const user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('should display team menu', async function(assert) {
        // when
        await visit('/');

        // then
        assert.dom('.sidebar-menu a').exists({ count: 2 });
        assert.dom('.sidebar-menu').containsText('Campagnes');
        assert.dom('.sidebar-menu').containsText('Équipe');
        assert.dom('.sidebar-menu a:first-child').hasClass('active');
      });

      test('should redirect to team page', async function(assert) {
        // given
        await visit('/');

        // when
        await click('.sidebar-menu a:nth-child(2)');

        // then
        assert.dom('.sidebar-menu a:first-child').hasText('Campagnes');
        assert.dom('.sidebar-menu').containsText('Équipe');
        assert.dom('.sidebar-menu a:nth-child(2)').hasClass('active');
        assert.dom('.sidebar-menu a:first-child').hasNoClass('active');
      });

      module('When prescriber belongs to an organization that is managing students', function(hooks) {

        hooks.beforeEach(async () => {
          const user = createUserManagingStudents('ADMIN');
          createPrescriberByUser(user);

          await authenticateSession({
            user_id: user.id,
            access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
            expires_in: 3600,
            token_type: 'Bearer token type',
          });
        });

        test('should display team and students menu', async function(assert) {
          // when
          await visit('/');

          // then
          assert.dom('.sidebar-menu a').exists({ count: 4 });
          assert.dom('.sidebar-menu').containsText('Campagnes');
          assert.dom('.sidebar-menu').containsText('Équipe');
          assert.dom('.sidebar-menu').containsText('Élèves');
          assert.dom('.sidebar-menu a:first-child ').hasClass('active');
        });

        test('should redirect to students page', async function(assert) {
          await visit('/');

          // when
          await click('.sidebar-menu a:nth-child(3)');

          // then
          assert.dom('.sidebar-menu').containsText('Campagnes');
          assert.dom('.sidebar-menu').containsText('Équipe');
          assert.dom('.sidebar-menu').containsText('Élèves');
          assert.dom('.sidebar-menu a:nth-child(3)').hasClass('active');
          assert.dom('.sidebar-menu a:first-child').hasNoClass('active');
        });

        test('should have resources link', async function(assert) {
          // given
          await visit('/');

          // then
          assert.contains('Documentation');
        });
      });
    });

    module('When user is member', function(hooks) {

      hooks.beforeEach(async () => {
        const user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('should not display team menu', async function(assert) {
        // when
        await visit('/');

        // then
        assert.dom('.sidebar-menu a').exists({ count: 1 });
        assert.dom('.sidebar-menu').containsText('Campagnes');
        assert.dom('.sidebar-menu a:first-child ').hasClass('active');
      });

      module('When user belongs to an organization that is managing students', function(hooks) {

        hooks.beforeEach(async () => {
          const user = createUserManagingStudents('MEMBER');
          createPrescriberByUser(user);

          await authenticateSession({
            user_id: user.id,
            access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
            expires_in: 3600,
            token_type: 'Bearer token type',
          });
        });

        test('should display students menu', async function(assert) {
          // when
          await visit('/');

          // then
          assert.dom('.sidebar-menu a').exists({ count: 3 });
          assert.dom('.sidebar-menu').containsText('Campagnes');
          assert.dom('.sidebar-menu').containsText('Élèves');
          assert.dom('.sidebar-menu a:first-child ').hasClass('active');
        });
      });
    });
  });

});
