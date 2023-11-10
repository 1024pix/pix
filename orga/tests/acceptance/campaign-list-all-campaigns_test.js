import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | campaigns/all-campaigns', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible', async function (assert) {
      // given / when
      await visit('/campagnes/toutes');

      // then
      assert.deepEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('it should be accessible', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);
      await authenticateSession(user.id);

      // when
      await visit('/campagnes/toutes');

      // then
      assert.deepEqual(currentURL(), '/campagnes/toutes');
    });

    module('When there are campaigns', function () {
      test('it should list the campaigns of the current organization', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        server.createList('campaign', 12);

        // when
        const screen = await visit('/campagnes/toutes');

        // then
        assert.strictEqual(screen.getAllByLabelText('Campagne').length, 12, 'the number of campaigns');
      });

      test('it should redirect to campaign details on click', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });
        await visit('/campagnes/toutes');

        // when
        await clickByName('CampagneEtPrairie');

        // then
        assert.strictEqual(currentURL(), '/campagnes/1');
      });

      module('When using owner filter', function () {
        test('it should update URL with owner first name filter', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          const owner = server.create('user', { firstName: 'Harry', lastName: 'Cojaune' });
          server.create('campaign', { ownerFirstName: owner.firstName, ownerLastName: owner.lastName });
          await visit('/campagnes/toutes');

          // when
          await fillByLabel('Rechercher un propriétaire', owner.firstName);

          // then
          assert.strictEqual(currentURL(), `/campagnes/toutes?ownerName=${owner.firstName}`);
        });

        test('it should remove owner filter in URL', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          const owner = server.create('user', { firstName: 'Harry', lastName: 'Jaune' });
          server.create('campaign', { ownerFirstName: owner.firstName, ownerLastName: owner.lastName });
          await visit(`/campagnes/toutes?ownerName=${owner.firstName}`);

          // when
          await fillByLabel('Rechercher un propriétaire', '');

          // then
          assert.strictEqual(currentURL(), '/campagnes/toutes');
        });

        test('it should filter campaigns by owner first name or last name', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          const owner = server.create('user', { firstName: 'Harry', lastName: 'Gole' });
          const otherOwner = server.create('user', { firstName: 'Sara', lastName: 'Conte' });
          server.create('campaign', {
            name: 'ma super campagne',
            ownerFirstName: owner.firstName,
            ownerLastName: owner.lastName,
          });
          server.create('campaign', {
            name: 'la campagne de Sara',
            ownerFirstName: otherOwner.firstName,
            ownerLastName: otherOwner.lastName,
          });
          const screen = await visit('/campagnes/toutes');

          // when
          await fillByLabel('Rechercher un propriétaire', owner.firstName);

          // then
          assert.ok(screen.getByText('ma super campagne'));
          assert.notOk(screen.queryByLabelText('la campagne de Sara'));
        });
      });

      module('When using campaign filter', function () {
        test('it should filter campaigns by campaign name', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          server.create('campaign', {
            name: 'ma super campagne',
          });
          server.create('campaign', {
            name: 'la campagne de Sara',
          });
          const screen = await visit('/campagnes/toutes');

          // when
          await fillByLabel('Rechercher une campagne', 'Sara');

          // then
          assert.ok(screen.getByText('la campagne de Sara'));
          assert.notOk(screen.queryByLabelText('ma super campagne'));
        });

        test('it should update URL with campaign name filter', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          const campaignName = 'CampagneV2';
          server.create('campaign', { name: campaignName });
          await visit('/campagnes/toutes');

          // when
          await fillByLabel('Rechercher une campagne', campaignName);

          // then
          assert.deepEqual(currentURL(), `/campagnes/toutes?name=${campaignName}`);
        });
      });

      module('When using campaign and owner filters', function () {
        test('it should filter campaigns', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          const owner = server.create('user', { firstName: 'Harry', lastName: 'Gole' });
          const otherOwner = server.create('user', { firstName: 'Sara', lastName: 'Conte' });
          server.create('campaign', {
            name: 'ma super campagne',
            ownerFirstName: owner.firstName,
            ownerLastName: owner.lastName,
          });
          server.create('campaign', {
            name: 'Evaluation',
            ownerFirstName: owner.firstName,
            ownerLastName: owner.lastName,
          });
          server.create('campaign', {
            name: 'la campagne de Sara',
            ownerFirstName: otherOwner.firstName,
            ownerLastName: otherOwner.lastName,
          });
          const screen = await visit('/campagnes/toutes');

          // when
          await fillByLabel('Rechercher un propriétaire', 'Harry');
          await fillByLabel('Rechercher une campagne', 'campagne');

          // then
          assert.ok(screen.getByText('ma super campagne'));
          assert.notOk(screen.queryByText('Evaluation'));
          assert.notOk(screen.queryByText('la campagne de Sara'));
        });
      });

      module('With clear all filters button', function () {
        test('it should clear archived, campaign and owner filter on click and display all active campaigns', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);
          const campaignName1 = 'ma super campagne';

          const owner = server.create('user', { firstName: 'Harry', lastName: 'Gole' });
          server.create('campaign', {
            name: campaignName1,
            ownerFirstName: owner.firstName,
            ownerLastName: owner.lastName,
          });
          const screen = await visit('/campagnes/toutes');

          // when
          await fillByLabel('Rechercher une campagne', campaignName1);
          await fillByLabel('Rechercher un propriétaire', owner.firstName);
          await clickByName('Archivées');
          await clickByName(this.intl.t('pages.campaigns-list.filter.clear'));

          //then
          assert.ok(screen.getByLabelText(this.intl.t('pages.campaigns-list.filter.by-owner')));
          assert.ok(screen.getByLabelText(this.intl.t('pages.campaigns-list.filter.by-name')));
          assert.dom(screen.getByText('Actives')).hasClass('campaign-filters__tab--active');
          assert.deepEqual(currentURL(), '/campagnes/toutes');
        });
      });
    });

    module('When there is no campaign', function () {
      test('it should redirect to campaign details on click', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        // when
        const screen = await visit('/campagnes/toutes');

        // then
        assert.ok(screen.getByText(this.intl.t('pages.campaigns-list.no-campaign')));
      });
    });
  });
});
