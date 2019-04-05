import { module, test } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details', function (hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function () {

    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

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
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should display by default parameters tab', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.dom('.campaign-details-content__update-button').exists();
      assert.dom('.navbar-item.active').hasText('Détails');
    });

    test('it should display participants tab', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });

      server.create('campaign-report', { id: 1, participationsCount: 2 });
      server.create('campaign', { id: 1, campaignReportId: 1 });

      // when
      await visit('/campagnes/1/participants');

      // then
      assert.dom('.participant-list__header').exists();
      assert.dom('.navbar-item.active').hasText('Participants (2)');
    });

    test('it should redirect to participants page on click on participants tab', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('campaign-report', { id: 1, participationsCount: 2 });
      server.create('campaign', { id: 1, campaignReportId: 1 });

      // when
      await visit('/campagnes/1');
      await click('.navbar-item:nth-child(2)');

      // then
      assert.dom('.navbar-item.active').hasText('Participants (2)');
      assert.equal(currentURL(), '/campagnes/1/participants');
    });

    test('it should redirect to update page on click on update button', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('campaign', { id: 1 });
      await visit('/campagnes/1');

      // when
      await click('.campaign-details-content__update-button');

      // then
      assert.equal(currentURL(), '/campagnes/1/modification');
    });

    test('it should redirect to update page on click on return button', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('campaign', { id: 1 });
      await visit('/campagnes/1');

      // when
      await click('.campaign-details-content__return-button');

      // then
      assert.equal(currentURL(), '/campagnes/liste');
    });
  });
});
