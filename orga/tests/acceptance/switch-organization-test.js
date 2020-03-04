import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserWithMultipleMemberships
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Switch Organization', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When connected user is linked to only one organization', function(hooks) {

    hooks.beforeEach(async function() {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
      await visit('/');
    });

    test('should display the main organization name and externalId in summary', function(assert) {
      assert.dom('.logged-user-summary__organization').hasText('BRO & Evil Associates (EXTBRO)');
    });

    test('should have no organization in menu', async function(assert) {
      await click('.logged-user-summary__link');

      assert.dom('.logged-user-menu-item__organization-name').doesNotExist();
    });

  });

  module('When connected user is linked to multiples organizations', function(hooks) {

    hooks.beforeEach(async function() {
      const user = createUserWithMultipleMemberships();
      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
      await visit('/');
    });

    test('should have an organization in menu', async function(assert) {
      await click('.logged-user-summary__link');

      assert.dom('.logged-user-menu-item__organization-name').exists();
      assert.dom('.logged-user-menu-item__organization-name').hasText('My Heaven Company');
      assert.dom('.logged-user-menu-item__organization-externalId').hasText('(HEAVEN)');
    });

    module('When user click on an organization', function() {

      test('should change main organization in summary', async function(assert) {
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        assert.dom('.logged-user-summary__organization').hasText('My Heaven Company (HEAVEN)');
      });

      test('should have the old main organization in the menu', async function(assert) {
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        assert.dom('.logged-user-menu-item__organization-name').exists();
        assert.dom('.logged-user-menu-item__organization-name').hasText('BRO & Evil Associates');
        assert.dom('.logged-user-menu-item__organization-externalId').hasText('(EXTBRO)');
      });
    });
  });
});
