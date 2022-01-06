import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import {
  fillByLabel,
  clickByName,
  selectByLabelAndOption,
  visit,
  selectOptionInRadioGroup,
} from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserThatCanCollectProfiles,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Creation', function (hooks) {
  let availableTargetProfiles;

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(() => {
    availableTargetProfiles = server.createList('target-profile', 2);
  });

  test('it should not be accessible by an unauthenticated user', async function (assert) {
    // when
    await visit('/campagnes/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  module('when the prescriber is authenticated', (hooks) => {
    hooks.beforeEach(async function () {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
      await visit('/campagnes/creation');
    });

    hooks.afterEach(function () {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    test('it should be accessible for an authenticated prescriber', async function (assert) {
      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.contains("Création d'une campagne");
    });

    test('it should allow to create a campaign of type ASSESSMENT by default and redirect to the newly created campaign', async function (assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Oui');
      await fillByLabel('Libellé de l’identifiant', 'Mail Pro');
      await fillByLabel('Titre du parcours', 'Savoir rechercher');
      await fillByLabel("Texte de la page d'accueil", 'Texte personnalisé');

      // when
      await clickByName('Créer la campagne');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.equal(firstCampaign.name, 'Ma Campagne');
      assert.equal(firstCampaign.title, 'Savoir rechercher');
      assert.equal(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.equal(firstCampaign.customLandingPageText, 'Texte personnalisé');
      assert.equal(firstCampaign.idPixLabel, 'Mail Pro');
      assert.equal(currentURL(), '/campagnes/1/parametres');
    });

    test('it should display error on global form when error 500 is returned from backend', async function (assert) {
      // given
      const expectedTargetProfileName = availableTargetProfiles[1].name;
      server.post('/campaigns', {}, 500);

      // when
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Non');
      await clickByName('Créer la campagne');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.contains('Une erreur est survenue. Veuillez réessayer ultérieurement.');
    });
  });

  module('when prescriber is authenticated and can collect profiles', (hooks) => {
    hooks.beforeEach(async function () {
      const user = createUserThatCanCollectProfiles();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
      await visit('/campagnes/creation');
    });

    test('it should allow to create a campaign of type ASSESSMENT and redirect to the newly created campaign', async function (assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      await clickByName('Évaluer les participants');
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Non');

      // when
      await clickByName('Créer la campagne');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.equal(firstCampaign.name, 'Ma Campagne');
      assert.equal(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.equal(currentURL(), '/campagnes/1/parametres');
    });

    test('it should allow to create a campaign of type PROFILES_COLLECTION and redirect to the newly created campaign', async function (assert) {
      // given
      await clickByName('Collecter les profils Pix des participants');
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Non');

      // when
      await clickByName('Créer la campagne');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(currentURL(), '/campagnes/1/parametres');
    });

    test('it should create campaign if user changes type after filling the form', async function (assert) {
      // given
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      await clickByName('Évaluer les participants');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await fillByLabel('Titre du parcours', 'Savoir rechercher');
      await clickByName('Non');

      // when
      await clickByName('Créer la campagne');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(currentURL(), '/campagnes/1/parametres');
    });
  });
});
