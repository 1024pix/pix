import { click, fillIn, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import {
  resumeCampaignOfTypeProfilesCollectionByCode,
  completeCampaignOfTypeProfilesCollectionByCode,
} from '../helpers/campaign';
import { invalidateSession } from '../helpers/invalidate-session';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';
import { clickByLabel } from '../helpers/click-by-label';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

module('Acceptance | Campaigns | Resume Campaigns with type Profiles Collection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let campaign;
  let studentInfo;

  hooks.beforeEach(async function () {
    studentInfo = server.create('user', 'withEmail');
    await authenticateByEmail(studentInfo);
    campaign = server.create('campaign', { idPixLabel: 'email', type: PROFILES_COLLECTION });
    await resumeCampaignOfTypeProfilesCollectionByCode(campaign.code, true);
  });

  module('When the user is not logged', function (hooks) {
    hooks.beforeEach(async function () {
      await invalidateSession();
      await visit(`/campagnes/${campaign.code}`);
      await clickByLabel("C'est parti !");
    });

    test('should propose to signup', function (assert) {
      assert.dom(currentURL()).hasText('/inscription');
    });

    test('should redirect to send profile page when user logs in', async function (assert) {
      // given
      await click('[href="/connexion"]');
      await fillIn('#login', studentInfo.email);
      await fillIn('#password', studentInfo.password);

      // when
      await click('.sign-form-body__bottom-button button');

      // then
      assert.dom(currentURL()).hasText('/envoi-profil');
    });
  });

  module('When user is logged', async function () {
    module('When user has seen profile page but has not send it', async function () {
      test('should redirect directly to send profile page', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.dom(currentURL()).hasText('/envoi-profil');
      });
    });

    module('When user has already send his profile', async function () {
      test('should redirect directly to send already sent page', async function (assert) {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.dom(currentURL()).hasText('/deja-envoye');
      });

      test('should display profile card and pix score', async function (assert) {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.dom(contains('156')).exists();
        assert.dom(contains('AREA_1_TITLE')).exists();
        assert.dom(contains('Area_1_Competence_1_name')).exists();
      });
    });

    module('When the campaign is restricted and schooling-registration is disabled', function (hooks) {
      hooks.beforeEach(async function () {
        campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, type: PROFILES_COLLECTION });
        server.create('campaign-participation', { campaign });
      });

      test('should be able to resume', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.dom(currentURL()).hasText(`/campagnes/${campaign.code}/collecte/envoi-profil`);
      });

      test('should display results page', async function (assert) {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.dom(currentURL()).hasText(`/campagnes/${campaign.code}/collecte/deja-envoye`);
      });
    });
  });
});
