import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserWithMultipleMemberships,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Switch Organization', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When connected prescriber is linked to only one organization', function(hooks) {

    hooks.beforeEach(async function() {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
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
      await clickByLabel('Résumé utilisateur');

      // then
      assert.dom('.logged-user-menu-item__organization-name').doesNotExist();
    });
  });

  module('When connected prescriber is linked to multiples organizations', function(hooks) {

    hooks.beforeEach(async function() {
      const user = createUserWithMultipleMemberships();
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      await visit('/');
    });

    test('should have an organization in menu', async function(assert) {
      // when
      await clickByLabel('Résumé utilisateur');

      // then
      assert.dom('.logged-user-menu-item__organization-name').exists();
      assert.dom('.logged-user-menu-item__organization-name').hasText('My Heaven Company');
      assert.dom('.logged-user-menu-item__organization-externalId').hasText('(HEAVEN)');
    });

    module('When prescriber click on an organization', function() {

      test('should change main organization in summary', async function(assert) {
        // when
        await clickByLabel('Résumé utilisateur');
        await clickByLabel('My Heaven Company');

        // then
        assert.dom('.logged-user-summary__organization').hasText('My Heaven Company (HEAVEN)');
      });

      test('should have the old main organization in the menu', async function(assert) {
        // when
        await clickByLabel('Résumé utilisateur');
        await clickByLabel('My Heaven Company');
        await clickByLabel('Résumé utilisateur');

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
          await clickByLabel('Résumé utilisateur');
          await clickByLabel('My Heaven Company');

          // then
          assert.equal(currentURL(), '/campagnes');
        });
      });

      module('When user switch from a not managing student organization to a managing student organization', function() {

        test('it should display student menu item', async function(assert) {
          // when
          await clickByLabel('Résumé utilisateur');
          await clickByLabel('My Heaven Company');

          // then
          assert.dom('.sidebar').containsText('Élèves');
        });
      });
    });
  });
});
