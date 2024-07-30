import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import {
  createPrescriberByUser,
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserWithMultipleMemberships,
} from '../helpers/test-init';

module('Acceptance | Switch Organization', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When connected prescriber is linked to only one organization', function (hooks) {
    hooks.beforeEach(async function () {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
    });

    test('should display the main organization name and externalId in summary', async function (assert) {
      // when
      const screen = await visit('/');

      // then
      assert.ok(screen.getByText('BRO & Evil Associates (EXTBRO)'));
    });

    test('should only have disconnect item in menu', async function (assert) {
      // given
      await visit('/');

      // when
      await clickByName('Ouvrir le menu utilisateur');

      // then
      assert.dom('.user-logged-menu > li').exists({ count: 1 });
      assert.dom('.user-logged-menu > li').hasText('Se déconnecter');
    });
  });

  module('When connected prescriber is linked to multiples organizations', function (hooks) {
    hooks.beforeEach(async function () {
      const user = createUserWithMultipleMemberships();
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
    });

    test('should have an organization in menu', async function (assert) {
      // when
      await visit('/');
      await clickByName('Ouvrir le menu utilisateur');

      // then
      assert.dom('.user-logged-menu > li').exists({ count: 2 });
      assert.dom('.user-logged-menu > li').hasText('My Heaven Company (HEAVEN)');
    });

    module('When prescriber click on an organization', function () {
      test('should change main organization in summary', async function (assert) {
        // when
        const screen = await visit('/');

        await clickByName('Ouvrir le menu utilisateur');
        await clickByName('My Heaven Company (HEAVEN)');

        // then
        assert.ok(screen.getByText('My Heaven Company (HEAVEN)'));
      });

      test('should have the old main organization in the menu', async function (assert) {
        // when
        await visit('/');

        await clickByName('Ouvrir le menu utilisateur');
        await clickByName('My Heaven Company (HEAVEN)');
        await clickByName('Ouvrir le menu utilisateur');

        // then
        assert.dom('.user-logged-menu > li').exists({ count: 2 });
        assert.dom('.user-logged-menu > li').hasText('BRO & Evil Associates (EXTBRO)');
      });

      module('When prescriber is on campaign page with pagination', function () {
        test('it should reset the queryParams when redirecting', async function (assert) {
          // given
          await visit('/campagnes/les-miennes?pageNumber=2&pageSize=10&name=test&status=archived');

          // when
          await clickByName('Ouvrir le menu utilisateur');
          await clickByName('My Heaven Company (HEAVEN)');

          // then
          assert.strictEqual(currentURL(), '/campagnes/les-miennes');
        });
      });

      module(
        'When user switch from a not managing student organization to a managing student organization',
        function () {
          test('it should display student menu item', async function (assert) {
            // when
            await visit('/');

            await clickByName('Ouvrir le menu utilisateur');
            await clickByName('My Heaven Company (HEAVEN)');

            // then
            assert.dom('.sidebar').containsText('Élèves');
          });
        },
      );
    });
  });
});
