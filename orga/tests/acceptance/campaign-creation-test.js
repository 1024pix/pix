import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted, createUserThatCanCollectProfiles } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Creation', function(hooks) {
  let availableTargetProfiles;

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated user', async function(assert) {
    // when
    await visit('/campagnes/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  hooks.beforeEach(() => {
    availableTargetProfiles = server.createList('target-profile', 2);
  });

  module('when the user is authenticated', (hooks) => {
    hooks.beforeEach(async function() {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateUser(user.id);
      await visit('/campagnes/creation');
    });

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.dom('.page__title').hasText('Création d\'une campagne');
    });

    test('it should not display gdpr footnote', async function(assert) {
      // then
      assert.dom('.new-item-form__gdpr-information').isNotVisible();
    });

    test('it should display gdpr footnote', async function(assert) {
      // when
      await click('#askLabelIdPix');

      // then
      assert.dom('.new-item-form__gdpr-information').isVisible();
      assert.dom('.new-item-form__gdpr-information').hasText(
        '* En vertu de la loi Informatique et libertés, et en tant que responsable de traitement, soyez attentifs à ne pas demander de donnée particulièrement identifiante ou signifiante si ce n’est pas absolument indispensable. Le numéro de sécurité sociale (NIR) est à proscrire ainsi que toute donnée sensible.'
      );
    });

    test('it should allow to create a campaign of type ASSESSMENT by default and redirect to the newly created campaign', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      await fillIn('#campaign-target-profile', expectedTargetProfileId);
      await fillIn('#campaign-name', 'Ma Campagne');
      await click('#askLabelIdPix');
      await fillIn('#id-pix-label', 'Mail Pro');
      await fillIn('#campaign-title', 'Savoir rechercher');
      await fillIn('#custom-landing-page-text', 'Texte personnalisé');

      // when
      await click('button[type="submit"]');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.equal(firstCampaign.name, 'Ma Campagne');
      assert.equal(firstCampaign.title, 'Savoir rechercher');
      assert.equal(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.equal(firstCampaign.customLandingPageText, 'Texte personnalisé');
      assert.equal(firstCampaign.idPixLabel, 'Mail Pro');
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should display error on global form when error 500 is returned from backend', async function(assert) {
      // given
      server.post('/campaigns', {}, 500);

      // when
      await click('button[type="submit"]');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.dom('[data-test-notification-message="error"]').hasText('Quelque chose s\'est mal passé. Veuillez réessayer.');
    });
  });

  module('when user is authenticated and can collect profiles', (hooks) => {
    hooks.beforeEach(async function() {
      const user = createUserThatCanCollectProfiles();
      await authenticateUser(user.id);
      await visit('/campagnes/creation');
    });

    test('it should allow to create a campaign of type ASSESSMENT and redirect to the newly created campaign', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      await click('#assess-participants');
      await fillIn('#campaign-target-profile', expectedTargetProfileId);
      await fillIn('#campaign-name', 'Ma Campagne');
      await click('#doNotAskLabelIdPix');

      // when
      await click('button[type="submit"]');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.equal(firstCampaign.name, 'Ma Campagne');
      assert.equal(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should allow to create a campaign of type PROFILES_COLLECTION and redirect to the newly created campaign', async function(assert) {
      // given
      await click('#collect-participants-profile');
      await fillIn('#campaign-name', 'Ma Campagne');
      await click('#doNotAskLabelIdPix');

      // when
      await click('button[type="submit"]');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should create campaign if user changes type after filling the form', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      await click('#assess-participants');
      await fillIn('#campaign-target-profile', expectedTargetProfileId);
      await fillIn('#campaign-name', 'Ma Campagne');
      await fillIn('#campaign-title', 'Savoir rechercher');
      await click('#doNotAskLabelIdPix');
      await click('#collect-participants-profile');

      // when
      await click('button[type="submit"]');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(currentURL(), '/campagnes/1');
    });
  });
});

function authenticateUser(userId) {
  return authenticateSession({
    user_id: userId,
    access_token: 'aaa.' + btoa(`{"user_id":${userId},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}
