import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserThatCanCollectProfiles,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Creation', (hooks) => {

  let availableTargetProfiles;

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(() => {
    availableTargetProfiles = server.createList('target-profile', 2);
  });

  test('it should not be accessible by an unauthenticated user', async function(assert) {
    // when
    await visit('/campagnes/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  module('when the prescriber is authenticated', (hooks) => {

    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateUser(user.id);
      await visit('/campagnes/creation');
    });

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    test('it should be accessible for an authenticated prescriber', async function(assert) {
      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.contains('Création d\'une campagne');
    });

    test('it should allow to create a campaign of type ASSESSMENT by default and redirect to the newly created campaign', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;

      await fillInByLabel('Que souhaitez-vous tester ?', expectedTargetProfileId);
      await fillInByLabel('Nom de la campagne', 'Ma Campagne');
      await clickByLabel('Oui');
      await fillInByLabel('Libellé de l’identifiant', 'Mail Pro');
      await fillInByLabel('Titre du parcours', 'Savoir rechercher');
      await fillInByLabel('Texte de la page d\'accueil', 'Texte personnalisé');

      // when
      await clickByLabel('Créer la campagne');

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
      await clickByLabel('Créer la campagne');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.contains('Une erreur est survenue. Veuillez réessayer ultérieurement.');
    });
  });

  module('when prescriber is authenticated and can collect profiles', (hooks) => {

    hooks.beforeEach(async () => {
      const user = createUserThatCanCollectProfiles();
      createPrescriberByUser(user);

      await authenticateUser(user.id);
      await visit('/campagnes/creation');
    });

    test('it should allow to create a campaign of type ASSESSMENT and redirect to the newly created campaign', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      await clickByLabel('Évaluer les participants');
      await fillInByLabel('Que souhaitez-vous tester ?', expectedTargetProfileId);
      await fillInByLabel('Nom de la campagne', 'Ma Campagne');
      await clickByLabel('Non');

      // when
      await clickByLabel('Créer la campagne');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.equal(firstCampaign.name, 'Ma Campagne');
      assert.equal(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should allow to create a campaign of type PROFILES_COLLECTION and redirect to the newly created campaign', async function(assert) {
      // given
      await clickByLabel('Collecter les profils Pix des participants');
      await fillInByLabel('Nom de la campagne', 'Ma Campagne');
      await clickByLabel('Non');

      // when
      await clickByLabel('Créer la campagne');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should create campaign if user changes type after filling the form', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      await clickByLabel('Évaluer les participants');
      await fillInByLabel('Que souhaitez-vous tester ?', expectedTargetProfileId);
      await fillInByLabel('Nom de la campagne', 'Ma Campagne');
      await fillInByLabel('Titre du parcours', 'Savoir rechercher');
      await clickByLabel('Non');
      await clickByLabel('Collecter les profils Pix des participants');

      // when
      await clickByLabel('Créer la campagne');

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
