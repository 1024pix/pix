import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserWithMultipleMemberships,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Switch Organization', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When connected prescriber is linked to only one organization', function (hooks) {
    hooks.beforeEach(async function () {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('should only have disconnect item in menu', async function (assert) {
      // given
      const screen = await visit('/');

      // when
      await clickByName('Ouvrir le menu');
      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('link', { name: 'Se déconnecter' })).exists();
    });
  });

  module('When connected prescriber is linked to multiples organizations', function (hooks) {
    hooks.beforeEach(async function () {
      const user = createUserWithMultipleMemberships();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('should have an organization in menu', async function (assert) {
      // given
      const screen = await visit('/');

      // when
      await clickByName('Ouvrir le menu');
      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByText('BRO & Evil Associates')).exists();
    });

    module('When prescriber click on an organization', function () {
      test('should change main organization in summary', async function (assert) {
        // given
        const screen = await visit('/');
        await clickByName('Ouvrir le menu');
        await screen.findByRole('dialog');
        await clickByName('Sélectionner une organisation');

        // when
        await clickByName('My Heaven Company');

        // then
        assert.contains('My Heaven Company');
      });

      test('should have the old main organization in the menu', async function (assert) {
        // given
        const screen = await visit('/');
        await clickByName('Ouvrir le menu');
        await screen.findByRole('dialog');
        await clickByName('Sélectionner une organisation');
        await clickByName('My Heaven Company');

        // when
        await clickByName('Sélectionner une organisation');

        // then
        assert.dom(screen.getByRole('button', { name: 'BRO & Evil Associates' })).exists();
      });

      module('When prescriber is on campaign page with pagination', function () {
        test('it should reset the queryParams when redirecting', async function (assert) {
          // given
          const screen = await visit('/campagnes/les-miennes?pageNumber=2&pageSize=10&name=test&status=archived');
          await clickByName('Ouvrir le menu');
          await screen.findByRole('dialog');
          await clickByName('Sélectionner une organisation');

          // when
          await clickByName('My Heaven Company');

          // then
          assert.strictEqual(currentURL(), '/campagnes/les-miennes');
        });
      });
    });
  });
});
