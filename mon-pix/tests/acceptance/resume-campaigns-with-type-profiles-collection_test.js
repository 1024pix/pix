import { click, fillIn, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import {
  resumeCampaignOfTypeProfilesCollectionByCode,
  completeCampaignOfTypeProfilesCollectionByCode,
} from '../helpers/campaign';
import visit from '../helpers/visit';
import { invalidateSession } from '../helpers/invalidate-session';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';
import { clickByLabel } from '../helpers/click-by-label';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

describe('Acceptance | Campaigns | Resume Campaigns with type Profiles Collection', function () {
  setupApplicationTest();
  setupMirage();
  let campaign;
  let studentInfo;

  beforeEach(async function () {
    studentInfo = server.create('user', 'withEmail');
    await authenticateByEmail(studentInfo);
    campaign = server.create('campaign', { idPixLabel: 'email', type: PROFILES_COLLECTION });
    await resumeCampaignOfTypeProfilesCollectionByCode(campaign.code, true);
  });

  context('When the user is not logged', function () {
    beforeEach(async function () {
      await invalidateSession();
      await visit(`/campagnes/${campaign.code}`);
      await clickByLabel("C'est parti !");
    });

    it('should propose to signup', function () {
      expect(currentURL()).to.contains('/inscription');
    });

    it('should redirect to send profile page when user logs in', async function () {
      // given
      await click('[href="/connexion"]');
      await fillIn('#login', studentInfo.email);
      await fillIn('#password', studentInfo.password);

      // when
      await click('.sign-form-body__bottom-button button');

      // then
      expect(currentURL()).to.contains('/envoi-profil');
    });
  });

  context('When user is logged', async function () {
    context('When user has seen profile page but has not send it', async function () {
      it('should redirect directly to send profile page', async function () {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains('/envoi-profil');
      });
    });

    context('When user has already send his profile', async function () {
      it('should redirect directly to send already sent page', async function () {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains('/deja-envoye');
      });

      it('should display profile card and pix score', async function () {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(contains('156')).to.exist;
        expect(contains('AREA_1_TITLE')).to.exist;
        expect(contains('Area_1_Competence_1_name')).to.exist;
      });
    });

    context('When the campaign is restricted and schooling-registration is disabled', function () {
      beforeEach(async function () {
        campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, type: PROFILES_COLLECTION });
        server.create('campaign-participation', { campaign });
      });

      it('should be able to resume', async function () {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains(`/campagnes/${campaign.code}/collecte/envoi-profil`);
      });

      it('should display results page', async function () {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains(`/campagnes/${campaign.code}/collecte/deja-envoye`);
      });
    });
  });
});
