import { module, test } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should display by default parameters tab', async function(assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.dom('.navbar-item.active').hasText('Détails');
    });

    test('it should display participants tab', async function(assert) {
      // given
      server.create('campaign-report', { id: 1, participationsCount: 2 });
      server.create('campaign', { id: 1, campaignReportId: 1 });

      // when
      await visit('/campagnes/1/participants');

      // then
      assert.dom('.navbar-item.active').hasText('Participants (2)');
    });

    test('it should redirect to participants page on click on participants tab', async function(assert) {
      // given
      server.create('campaign-report', { id: 1, participationsCount: 2 });
      server.create('campaign', { id: 1, campaignReportId: 1 });

      // when
      await visit('/campagnes/1');
      await click('.navbar-item:nth-child(2)');

      // then
      assert.dom('.navbar-item.active').hasText('Participants (2)');
      assert.equal(currentURL(), '/campagnes/1/participants');
    });

    test('it should redirect to update page on click on update button', async function(assert) {
      // given
      server.create('campaign', { id: 1, type: 'TEST_GIVEN' });
      await visit('/campagnes/1');

      // when
      await click('.campaign-details-content__update-button');

      // then
      assert.equal(currentURL(), '/campagnes/1/modification');
    });

    test('it should redirect to update page on click on return button', async function(assert) {
      // given
      server.create('campaign', { id: 1 });
      await visit('/campagnes/1');

      // when
      await click('[aria-label="Retour"]');

      // then
      assert.equal(currentURL(), '/campagnes');
    });

    test('it should display collective results tab', async function(assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.dom('.navbar-item:nth-child(3)').hasText('Résultats collectifs');
    });

    test('it should redirect to collective results page on click on collective results tab', async function(assert) {
      // given
      const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
      server.create('campaign', { id: 1, campaignCollectiveResult });

      // when
      await visit('/campagnes/1');
      await click('.navbar-item:nth-child(3)');

      // then
      assert.dom('.navbar-item.active').hasText('Résultats collectifs');
      assert.equal(currentURL(), '/campagnes/1/resultats-collectifs');
    });

  });
});
