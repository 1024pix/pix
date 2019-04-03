import { module, test, only } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign List', function (hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;


  module('When user is not logged in', function () {

    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/campagnes/liste');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function () {

    hooks.beforeEach( async () => {
      user = createUserWithMembership();
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/campagnes/liste');

      // then
      assert.equal(currentURL(), '/campagnes/liste');
    });

    test('it should show title indicate than user can create a campaign', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/campagnes/liste');

      // then
      assert.dom('.page-title').hasText('Créez votre première campagne');
    });

    test('it should list the campaigns of the current organization', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.createList('campaign', 12);

      // when
      await visit('/campagnes/liste');

      // then
      assert.dom('.campaign-item').exists({ count: 12 });
    });

    test('it should redirect to campaign details on click', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('campaign', { id: 1 });
      await visit('/campagnes/liste');

      // when
      await click('.campaign-item');

      // then
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('PERFORMANCE TEST it should handle 20 campaigns with 100 participants each', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });

      const participationsCount = 100;

      const campaignReports = server.createList('campaign-report', 10, { participationsCount });
      console.log("====> campaignReports OK");

      const campaigns = campaignReports.map(campaignReport => {
        return server.create('campaign', { campaignReport });
      });

      campaigns.map(campaign => {
        const users = server.createList('user', participationsCount);

        users.map(user => {
          server.create('campaign-participation', { user, campaign });
        })
      });

      // when
      await visit('/campagnes/liste');

      // then
      assert.dom('.campaign-item').exists({ count: 10 });
    });
  });
});
