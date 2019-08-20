import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserManagingStudents
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Student List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/eleves');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function() {

    module('When organization is not managing students or is not SCO', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserWithMembershipAndTermsOfServiceAccepted();

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('should not be accessible', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.equal(currentURL(), '/campagnes');
      });
    });

    module('When organization is managing students', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserManagingStudents();

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should be accessible', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.equal(currentURL(), '/eleves');
      });

      test('it should show title of team page', async function(assert) {
        // when
        await visit('/eleves');

        // then
        assert.dom('.page-title').hasText('Élèves');
      });

      test('it should list the students', async function(assert) {
        // given
        const organizations = server.schema.organizations.where({});
        server.createList('students', 6, { organization: organizations.models[0] });

        // when
        await visit('/eleves');

        // then
        assert.dom('.table tbody tr').exists({ count: 6 });
      });

      module('When user is owner in organization', function(hooks) {

        hooks.beforeEach(async () => {
          user = createUserManagingStudents('OWNER');
          await authenticateSession({
            user_id: user.id,
            access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
            expires_in: 3600,
            token_type: 'Bearer token type',
          });
        });

        test('it should display import button', async function(assert) {
          // when
          await visit('/eleves');
          
          // then
          assert.dom('.button').hasText('Importer (.xml)');
        });
      });

      module('When user is not owner in organization', function() {

        test('it should not display import button', async function(assert) {
          // given
          user = createUserManagingStudents('MEMBER');
          await authenticateSession({
            user_id: user.id,
            access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
            expires_in: 3600,
            token_type: 'Bearer token type',
          });

          // when
          await visit('/eleves');

          // then
          assert.dom('.button').doesNotExist();
        });
      });
    });

  });
});
