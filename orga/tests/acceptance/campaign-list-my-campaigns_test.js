import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | /campaigns/list/my-campaigns ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible', async function (assert) {
      // given / when
      await visitScreen('/campagnes');

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
      await visitScreen('/campagnes');

      // then
      assert.deepEqual(currentURL(), '/campagnes/les-miennes');
    });

    module('When there are campaigns', function () {
      test('it should only list the campaigns of the current user', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        server.create('campaign', { ownerLastName: 'Dupuis', ownerFirstName: 'Mathilde' });
        server.create('campaign', { ownerLastName: user.lastName, ownerFirstName: user.firstName });
        server.create('campaign', { ownerLastName: user.lastName, ownerFirstName: user.firstName });

        // when
        const screen = await visitScreen('/campagnes');

        // then
        assert.strictEqual(screen.getAllByLabelText('Campagne').length, 2, 'the number of campaigns');
      });

      test('it should redirect to campaign details on click', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        server.create('campaign', {
          id: 1,
          name: 'CampagneEtPrairie',
          ownerLastName: user.lastName,
          ownerFirstName: user.firstName,
        });
        await visitScreen('/campagnes');

        // when
        await clickByName('CampagneEtPrairie');

        // then
        assert.deepEqual(currentURL(), '/campagnes/1');
      });

      module('When using campaign filter', function () {
        test('it should filter campaigns by campaign name', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          server.create('campaign', {
            name: 'ma super campagne',
            ownerLastName: user.lastName,
            ownerFirstName: user.firstName,
          });
          server.create('campaign', {
            name: 'la campagne de Sara',
            ownerLastName: user.lastName,
            ownerFirstName: user.firstName,
          });
          const screen = await visitScreen('/campagnes');

          // when
          await fillByLabel('Rechercher une campagne', 'super');

          // then
          assert.dom(screen.getByText('ma super campagne')).exists();
          assert.dom(screen.queryByLabelText('la campagne de Sara')).doesNotExist();
        });

        test('it should update URL with campaign name filter', async function (assert) {
          // given
          const user = createUserWithMembershipAndTermsOfServiceAccepted();
          createPrescriberByUser(user);
          await authenticateSession(user.id);

          const campaignName = 'CampagneV2';
          server.create('campaign', {
            name: campaignName,
            ownerLastName: user.lastName,
            ownerFirstName: user.firstName,
          });
          await visitScreen('/campagnes');

          // when
          await fillByLabel('Rechercher une campagne', campaignName);

          // then
          assert.deepEqual(currentURL(), `/campagnes/les-miennes?name=${campaignName}`);
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
        const screen = await visitScreen('/campagnes');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.campaigns-list.no-campaign'))).exists();
      });
    });
  });
});
