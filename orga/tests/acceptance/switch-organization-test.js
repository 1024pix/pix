import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
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
  });

  module('When connected prescriber is linked to multiples organizations', function (hooks) {
    hooks.beforeEach(async function () {
      const user = createUserWithMultipleMemberships();
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
    });

    test('should have an organization in menu', async function (assert) {
      // when
      const screen = await visit('/');
      const button = screen.getByRole('button', { name: "Changer d'organisation" });
      await click(button);
      // then
      const listbox = await screen.findAllByRole('option');
      assert.strictEqual(listbox.length, 2);
      assert.ok(await screen.findByRole('option', { name: 'BRO & Evil Associates (EXTBRO)' }));
    });

    module('When prescriber click on an organization', function () {
      test('should find the selected organization in list', async function (assert) {
        // when
        const screen = await visit('/');

        const button = screen.getByRole('button', { name: "Changer d'organisation" });
        await click(button);
        const organizationSelected = await screen.findByRole('option', { name: 'My Heaven Company (HEAVEN)' });
        await click(organizationSelected);

        // then
        assert.ok(organizationSelected);
      });

      test('should have the old main organization in the menu after switching', async function (assert) {
        // when
        const screen = await visit('/');

        const button = screen.getByRole('button', { name: "Changer d'organisation" });
        await click(button);

        const oldOrganization = await screen.findByRole('option', { name: 'My Heaven Company (HEAVEN)' });
        await click(screen.getByText('My Heaven Company (HEAVEN)'));
        await click(button);
        const listbox = await screen.findAllByRole('option');

        //then
        assert.strictEqual(listbox.length, 2);
        assert.ok(oldOrganization);
      });

      module('When prescriber is on campaign page with pagination', function () {
        test('it should redirect to homepage', async function (assert) {
          // given
          const screen = await visit('/campagnes/les-miennes?pageNumber=2&pageSize=10&name=test&status=archived');

          // when
          const button = screen.getByRole('button', { name: "Changer d'organisation" });
          await click(button);
          const oldOrganization = await screen.findByRole('option', { name: 'My Heaven Company (HEAVEN)' });
          await click(oldOrganization);

          // then
          assert.strictEqual(currentURL(), '/');
        });
      });

      module(
        'When user switch from a not managing student organization to a managing student organization',
        function () {
          test('it should display student menu item', async function (assert) {
            // when
            const screen = await visit('/');

            const button = screen.getByRole('button', { name: "Changer d'organisation" });
            await click(button);
            await click(screen.getByText('My Heaven Company (HEAVEN)'));

            // then
            assert.ok(screen.getByText('Élèves'));
          });
        },
      );

      module('When organization has places management feature', function (hooks) {
        let firstOrganization, secondOrganization, thirdOrganization, user;
        hooks.beforeEach(async () => {
          user = server.create('user', {
            firstName: 'Harry',
            lastName: 'Cover',
            email: 'harry@cover.com',
            lang: 'fr',
            pixOrgaTermsOfServiceStatus: 'accepted',
          });

          firstOrganization = server.create('organization', {
            name: 'First',
          });

          secondOrganization = server.create('organization', {
            name: 'Second',
          });

          thirdOrganization = server.create('organization', {
            name: 'Third',
          });

          const firstMembership = server.create('membership', {
            organizationId: firstOrganization.id,
            userId: user.id,
          });

          const secondMembership = server.create('membership', {
            organizationId: secondOrganization.id,
            userId: user.id,
          });

          const thirdMembership = server.create('membership', {
            organizationId: thirdOrganization.id,
            userId: user.id,
          });

          user.memberships = [firstMembership, secondMembership, thirdMembership];
          user.userOrgaSettings = server.create('user-orga-setting', { organization: thirdOrganization, user });
          createPrescriberByUser({
            user,
          });
          await authenticateSession(user.id);
        });

        test('it should display available places in sidebar for current organization', async function (assert) {
          // given
          server.create('organization-place-statistic', { id: firstOrganization.id, available: 120 });
          server.create('organization-place-statistic', { id: secondOrganization.id, available: 240 });

          // when
          const screen = await visit('/');

          assert.notOk(screen.queryByText(t('navigation.places.number', { count: 0 })));

          const prescriber = server.schema.prescribers.find(user.id);
          prescriber.update({
            features: {
              PLACES_MANAGEMENT: { active: true, params: null },
            },
          });

          const button = screen.getByRole('button', { name: "Changer d'organisation" });
          await click(button);
          await click(screen.getByText('First'));

          assert.ok(screen.getByText(t('navigation.places.number', { count: 120 })));

          await click(button);
          await click(screen.getByText('Second'));

          // then
          assert.ok(screen.getByText(t('navigation.places.number', { count: 240 })));
        });
      });
    });
  });
});
