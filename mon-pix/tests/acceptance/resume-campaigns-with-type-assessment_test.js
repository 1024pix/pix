import { click, fillIn, currentURL, visit } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import { clickByLabel } from '../helpers/click-by-label';
import { invalidateSession } from '../helpers/invalidate-session';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const ASSESSMENT = 'ASSESSMENT';

describe('Acceptance | Campaigns | Resume Campaigns with type Assessment', function () {
  setupApplicationTest();
  setupMirage();
  let campaign;
  let studentInfo;

  beforeEach(async function () {
    studentInfo = server.create('user', 'withEmail');
    await authenticateByEmail(studentInfo);
    campaign = server.create('campaign', { idPixLabel: 'email', type: ASSESSMENT });
    await resumeCampaignOfTypeAssessmentByCode(campaign.code, true);
  });

  context('When the user is not logged', function () {
    beforeEach(async function () {
      await invalidateSession();
      await visit(`/campagnes/${campaign.code}`);
      await clickByLabel('Je commence');
    });

    it('should propose to signup', function () {
      expect(currentURL()).to.contains('/inscription');
    });

    it('should redirect to campaign participation when user logs in', async function () {
      // given
      await click('[href="/connexion"]');
      await fillIn('#login', studentInfo.email);
      await fillIn('#password', studentInfo.password);

      // when
      await click('.sign-form-body__bottom-button button');

      // then
      expect(currentURL()).to.contains('/assessments/');
    });
  });

  context('When user is logged', async function () {
    context('When there is no more questions', async function () {
      it('should redirect to last checkpoint page', async function () {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains('/checkpoint?finalCheckpoint=true');
      });
    });

    context('When user has completed his campaign participation', async function () {
      it('should redirect directly to results', async function () {
        // given
        await visit(`/campagnes/${campaign.code}`);
        await clickByLabel('Voir mes résultats');

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains(`/campagnes/${campaign.code}/evaluation/resultats`);
      });
    });

    context('When user has already send his results', async function () {
      it('should redirect directly to shared results', async function () {
        // given
        await visit(`/campagnes/${campaign.code}`);
        await clickByLabel('Voir mes résultats');
        await clickByLabel("J'envoie mes résultats");

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains(`/campagnes/${campaign.code}/evaluation/resultats`);
      });
    });

    context('When the campaign is restricted and schooling-registration is disabled', function () {
      beforeEach(async function () {
        campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, type: ASSESSMENT });
        server.create('campaign-participation', { campaign });
      });

      it('should be able to resume', async function () {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains('/assessments/');
      });

      it('should display results page', async function () {
        // when
        await visit(`/campagnes/${campaign.code}`);
        await clickByLabel('Voir mes résultats');

        // then
        expect(currentURL()).to.contains(`/campagnes/${campaign.code}/evaluation/resultats`);
      });
    });
  });
});
