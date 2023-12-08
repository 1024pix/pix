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
    test('it should be accessible and prescriber redirected to his campaigns list', async function (assert) {
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
        const otherUser = server.create('user');
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        server.create('campaign', {
          ownerLastName: otherUser.lastName,
          ownerFirstName: otherUser.firstName,
        });
        server.create('campaign', {
          ownerId: user.id,
          ownerLastName: user.lastName,
          ownerFirstName: user.firstName,
        });
        server.create('campaign', {
          ownerId: user.id,
          ownerLastName: user.lastName,
          ownerFirstName: user.firstName,
        });

        // when
        const screen = await visitScreen('/campagnes/les-miennes');

        // then
        assert.strictEqual(screen.getAllByRole('row').length, 3, 'Table length included header');
      });

      test('it should redirect to campaign details on click', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);

        server.create('campaign', {
          id: 1,
          name: 'CampagneEtPrairie',
          ownerId: user.id,
          ownerLastName: user.lastName,
          ownerFirstName: user.firstName,
        });
        await visitScreen('/campagnes/les-miennes');

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
            ownerId: user.id,
            ownerLastName: user.lastName,
            ownerFirstName: user.firstName,
          });
          server.create('campaign', {
            name: 'la campagne de Sara',
            ownerId: user.id,
            ownerLastName: user.lastName,
            ownerFirstName: user.firstName,
          });
          const screen = await visitScreen('/campagnes/les-miennes');

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
            ownerId: user.id,
            ownerLastName: user.lastName,
            ownerFirstName: user.firstName,
          });
          await visitScreen('/campagnes/les-miennes');

          // when
          await fillByLabel('Rechercher une campagne', campaignName);

          // then
          assert.deepEqual(currentURL(), `/campagnes/les-miennes?name=${campaignName}`);
        });

        module('With clear all filters button', function () {
          test("it should clear campaign filters on click and display active owner's campaigns", async function (assert) {
            // given
            const user = createUserWithMembershipAndTermsOfServiceAccepted();
            createPrescriberByUser(user);
            await authenticateSession(user.id);

            server.create('campaign', {
              name: 'ma super campagne',
              ownerId: user.id,
              ownerLastName: user.lastName,
              ownerFirstName: user.firstName,
            });

            const screen = await visitScreen('/campagnes/les-miennes');

            // when
            await fillByLabel('Rechercher une campagne', 'ma super campagne');
            await clickByName('Archivées');
            await clickByName(this.intl.t('pages.campaigns-list.filter.clear'));

            //then
            assert.ok(screen.getByPlaceholderText(this.intl.t('pages.campaigns-list.filter.by-name')));
            assert.dom(screen.getByText('Actives')).hasClass('campaign-filters__tab--active');
            assert.deepEqual(currentURL(), '/campagnes/les-miennes');
          });
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
        const screen = await visitScreen('/campagnes/les-miennes');

        // then
        assert.ok(screen.getByText(this.intl.t('pages.campaigns-list.no-campaign')));
      });
    });
  });
});
