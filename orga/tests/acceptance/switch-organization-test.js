import { module, test } from 'qunit';
import { click, visit , currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserWithMultipleMemberships,
  createPrescriberByUser
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Switch Organization', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When connected prescriber is linked to only one organization', function(hooks) {

    hooks.beforeEach(async function() {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('should display the main organization name and externalId in summary', async function(assert) {
      // when
      await visit('/');

      // then
      assert.dom('.logged-user-summary__organization').hasText('BRO & Evil Associates (EXTBRO)');
    });

    test('should have no organization in menu', async function(assert) {
      // given
      await visit('/');

      // when
      await click('.logged-user-summary__link');

      // then
      assert.dom('.logged-user-menu-item__organization-name').doesNotExist();
    });
  });

  module('When connected prescriber is linked to multiples organizations', function(hooks) {

    hooks.beforeEach(async function() {
      const user = createUserWithMultipleMemberships();
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });

      await visit('/');
    });

    test('should have an organization in menu', async function(assert) {
      // when
      await click('.logged-user-summary__link');

      // then
      assert.dom('.logged-user-menu-item__organization-name').exists();
      assert.dom('.logged-user-menu-item__organization-name').hasText('My Heaven Company');
      assert.dom('.logged-user-menu-item__organization-externalId').hasText('(HEAVEN)');
    });

    module('When prescriber click on an organization', function() {

      test('should change main organization in summary', async function(assert) {
        // when
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        // then
        assert.dom('.logged-user-summary__organization').hasText('My Heaven Company (HEAVEN)');
      });

      test('should have the old main organization in the menu', async function(assert) {
        // when
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');
        await click('.logged-user-summary__link');

        // then
        assert.dom('.logged-user-menu-item__organization-name').exists();
        assert.dom('.logged-user-menu-item__organization-name').hasText('BRO & Evil Associates');
        assert.dom('.logged-user-menu-item__organization-externalId').hasText('(EXTBRO)');
      });

      module('When prescriber is on campaign page with pagination', function() {

        test('it should reset the queryParams when redirecting', async function(assert) {
          // given
          await visit('/campagnes?pageNumber=2&pageSize=10&name=test&status=archived');

          // when
          await click('.logged-user-summary__link');
          await click('.logged-user-menu-item');

          // then
          assert.equal(currentURL(), '/campagnes');
        });
      });

      module('When user switch from a not managing student organization to a managing student organization', function() {

        test('it should display student menu item', async function(assert) {
          // when
          await click('.logged-user-summary__link');
          await click('.logged-user-menu-item');

          // then
          assert.dom('.sidebar').containsText('Élèves');
        });
      });
    });
  });
});
