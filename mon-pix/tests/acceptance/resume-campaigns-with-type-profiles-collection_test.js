import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import {
  completeCampaignOfTypeProfilesCollectionByCode,
  resumeCampaignOfTypeProfilesCollectionByCode,
} from '../helpers/campaign';
import { invalidateSession } from '../helpers/invalidate-session';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

module('Acceptance | Campaigns | Resume Campaigns with type Profiles Collection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let campaign;
  let studentInfo;

  hooks.beforeEach(async function () {
    studentInfo = this.server.create('user', 'withEmail');
    await authenticate(studentInfo);
    campaign = this.server.create('campaign', { idPixLabel: 'email', type: PROFILES_COLLECTION });
    await resumeCampaignOfTypeProfilesCollectionByCode(campaign.code, true);
  });

  module('When the user is not logged', function (hooks) {
    hooks.beforeEach(async function () {
      await invalidateSession();
    });

    test('should propose to signup', async function (assert) {
      const screen = await visit(`/campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: "C'est parti !" }));

      assert.ok(currentURL().includes('/inscription'));
    });

    test('should redirect to send profile page when user logs in', async function (assert) {
      // given
      const screen = await visit(`/campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: "C'est parti !" }));

      await click(screen.getByRole('link', { name: 'connectez-vous à votre compte' }));
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), studentInfo.email);
      await fillIn(screen.getByLabelText('Mot de passe'), studentInfo.password);

      // when
      await click(screen.getByRole('button', { name: 'Je me connecte' }));

      // then
      assert.ok(currentURL().includes('/envoi-profil'));
    });
  });

  module('When user is logged', function () {
    module('When user has seen profile page but has not send it', function () {
      test('should redirect directly to send profile page', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes('/envoi-profil'));
      });
    });

    module('When user has already send his profile', function () {
      test('should redirect directly to send already sent page', async function (assert) {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes('/deja-envoye'));
      });

      test('should display profile card and pix score', async function (assert) {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        const screen = await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(screen.getByText('206'));
        const area1Titles = screen.getAllByText('Area_1_title').length;

        assert.strictEqual(area1Titles, 2);
        assert.ok(screen.getByText('Area_1_Competence_1_name'));
      });
    });

    module('When the campaign is restricted and organization learner is disabled', function (hooks) {
      hooks.beforeEach(async function () {
        campaign = this.server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, type: PROFILES_COLLECTION });
        this.server.create('campaign-participation', { campaign });
      });

      test('should be able to resume', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes(`/campagnes/${campaign.code}/collecte/envoi-profil`));
      });

      test('should display results page', async function (assert) {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes(`/campagnes/${campaign.code}/collecte/deja-envoye`));
      });
    });
  });
});
