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
  createPrescriberByUser,
  createMembershipByOrganizationIdAndUser,
} from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Creation', function (hooks) {
  let availableTargetProfiles;

  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(() => {
    availableTargetProfiles = server.createList('target-profile', 2);
  });

  test('it should not be accessible by an unauthenticated user', async function (assert) {
    // when
    await visit('/campagnes/creation');

    // then
    assert.strictEqual(currentURL(), '/connexion');
  });

  module('when the prescriber is authenticated', (hooks) => {
    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    hooks.afterEach(function () {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    test('it should be accessible for an authenticated prescriber', async function (assert) {
      // when
      await visit('/campagnes/creation');

      // then
      assert.strictEqual(currentURL(), '/campagnes/creation');
      assert.contains("Création d'une campagne");
    });

    test('it should allow to create a campaign of type ASSESSMENT and redirect to the newly created campaign', async function (assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      await visit('/campagnes/creation');
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await clickByName('Évaluer les participants');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Non');

      // when
      await clickByName('Créer la campagne');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.strictEqual(firstCampaign.name, 'Ma Campagne');
      assert.strictEqual(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });

    test('it should allow to create a campaign of type PROFILES_COLLECTION and redirect to the newly created campaign', async function (assert) {
      // given
      await visit('/campagnes/creation');
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await clickByName('Collecter les profils Pix des participants');
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Non');

      // when
      await clickByName('Créer la campagne');

      // then
      assert.strictEqual(server.db.campaigns[0].name, 'Ma Campagne');
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });

    test('it should create campaign if user changes type after filling the form', async function (assert) {
      // given
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      await visit('/campagnes/creation');
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await clickByName('Évaluer les participants');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await fillByLabel('Titre du parcours', 'Savoir rechercher');
      await clickByName('Non');

      // when
      await clickByName('Créer la campagne');

      // then
      assert.strictEqual(server.db.campaigns[0].name, 'Ma Campagne');
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });

    test('it should set the current user as owner by default when creating a campaign', async function (assert) {
      // given
      const targetProfileName = availableTargetProfiles[1].name;
      const screen = await visit('/campagnes/creation');
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await clickByName('Évaluer les participants');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', targetProfileName);

      // when
      await clickByName('Créer la campagne');

      // then
      assert.dom(screen.getByText('Harry Cover', { selector: 'dd' })).exists();
    });

    test('it should be possible to change default campaign owner', async function (assert) {
      // given
      const organization = server.create('organization', { name: 'BRO & Evil Associates' });

      const currentUser = server.create('user', {
        id: 7,
        firstName: 'Coco',
        lastName: 'Cover',
        email: 'harry@cover.com',
        pixOrgaTermsOfServiceAccepted: true,
      });
      currentUser.userOrgaSettings = server.create('user-orga-setting', { user: currentUser, organization });
      const currentUserWithMembership = createMembershipByOrganizationIdAndUser(organization.id, currentUser);
      createPrescriberByUser(currentUserWithMembership);

      const otherUser = server.create('user', {
        id: 10,
        firstName: 'Tom',
        lastName: 'Égérie',
        pixOrgaTermsOfServiceAccepted: true,
      });
      const otherUserWithMembership = createMembershipByOrganizationIdAndUser(organization.id, otherUser);
      createPrescriberByUser(otherUserWithMembership);

      await authenticateSession(currentUser.id);

      const screen = await visit('/campagnes/creation');

      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await clickByName('Évaluer les participants');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', availableTargetProfiles[1].name);

      // when
      await selectByLabelAndOption(this.intl.t('pages.campaign-creation.owner.label'), 'Tom Égérie');
      await clickByName('Créer la campagne');

      // then
      assert.dom(screen.getByText('Tom Égérie', { selector: 'dd' })).exists();
    });

    test('it should display error on global form when error 500 is returned from backend', async function (assert) {
      // given
      await visit('/campagnes/creation');

      const expectedTargetProfileName = availableTargetProfiles[1].name;
      server.post('/campaigns', {}, 500);

      // when
      await fillByLabel('* Nom de la campagne', 'Ma Campagne');
      await clickByName('Évaluer les participants');
      await selectByLabelAndOption('Que souhaitez-vous tester ?', expectedTargetProfileName);
      await selectOptionInRadioGroup('Souhaitez-vous demander un identifiant externe ?', 'Non');
      await clickByName('Créer la campagne');

      // then
      assert.strictEqual(currentURL(), '/campagnes/creation');
      assert.contains('Une erreur est survenue. Veuillez réessayer ultérieurement.');
    });
  });
});
