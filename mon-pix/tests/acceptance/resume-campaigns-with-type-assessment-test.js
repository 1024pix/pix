import {
  click,
  fillIn,
  currentURL,
  find,
  findAll,
} from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import {
  completeCampaignOfTypeAssessmentAndSeeResultsByCode,
  completeCampaignOfTypeAssessmentByCode,
  resumeCampaignOfTypeAssessmentByCode,
} from '../helpers/campaign';
import visit from '../helpers/visit';
import { invalidateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const ASSESSMENT = 'ASSESSMENT';

describe('Acceptance | Campaigns | Resume Campaigns with type Assessment', function() {
  setupApplicationTest();
  setupMirage();
  let campaign;

  describe('Resume 1 campaign', function() {
    let studentInfo;

    beforeEach(async function() {
      studentInfo = server.create('user', 'withEmail');
      await authenticateByEmail(studentInfo);
      campaign = server.create('campaign', { idPixLabel: 'email', type: ASSESSMENT }, 'withThreeChallenges');
      await resumeCampaignOfTypeAssessmentByCode(campaign.code, true);
    });

    context('When the user is not logged', function() {

      beforeEach(async function() {
        await invalidateSession();
        this.owner.lookup('route:campaigns.start-or-resume')._resetState();
        await visit(`/campagnes/${campaign.code}`);
        await click('.campaign-landing-page__start-button');
      });

      it('should propose to signup', function() {
        expect(currentURL()).to.contains('/inscription');
      });

      it('should redirect to assessment when user logs in', async function() {
        // given
        await click('.sign-form-header__subtitle [href="/connexion"]');
        await fillIn('#login', studentInfo.email);
        await fillIn('#password', studentInfo.password);

        // when
        await click('.sign-form-body__bottom-button button');

        // then
        expect(currentURL()).to.contains('/assessments/');
      });

    });

    context('When user is logged', async function() {

      context('When user has started his assessment, answered one question and came back', async function() {

        it('should redirect directly in assessment', async function() {
          // when
          await visit(`/campagnes/${campaign.code}`);

          // then
          expect(currentURL()).to.contains('/assessments/');
          expect(findAll('.progress-bar-stepnum.active').length).to.equals(2);
        });
      });

      context('When user has started his assessment and came back with query params', function() {

        it('should redirect to assessment', async function() {
          // when
          await visit(`/campagnes/${campaign.code}?participantExternalId=a7Eat01r3`);

          // then
          expect(currentURL()).to.contains('/assessments/');
          expect(findAll('.progress-bar-stepnum.active').length).to.equals(2);
        });
      });

      context('When user has completed his assessment', async function() {

        it('should show the last checkpoint page', async function() {
          // given
          await completeCampaignOfTypeAssessmentByCode(campaign.code);

          // when
          await visit(`/campagnes/${campaign.code}`);

          expect(currentURL()).to.contains('checkpoint?finalCheckpoint=true');
          expect(find('.checkpoint__continue-button').textContent).to.contains('Voir mes résultats');
        });

        it('should show the results page when user clicks on "voir mes résultats"', async function() {
          // given
          await completeCampaignOfTypeAssessmentByCode(campaign.code);
          await visit(`/campagnes/${campaign.code}`);

          // when
          await click('.checkpoint__continue-button');

          expect(currentURL()).to.contains('resultats');
        });

        context('When user has not shared his results', async function() {

          it('should suggest to share his results', async function() {
            // when
            await completeCampaignOfTypeAssessmentAndSeeResultsByCode(campaign.code);

            expect(find('.skill-review-share__button')).to.exist;
          });

          it('should thank the user when he clicks on the share button', async function() {
            // when
            await completeCampaignOfTypeAssessmentAndSeeResultsByCode(campaign.code);
            await click('.skill-review-share__button');

            expect(find('.skill-review-share__thanks')).to.exist;
          });
        });

        context('When user has shared his results', async function() {

          it('should still display thank message when reloading the page', async function() {
            // given
            await completeCampaignOfTypeAssessmentAndSeeResultsByCode(campaign.code);
            const currentAssessment = server.schema.campaignParticipations.findBy({ campaignId: campaign.id }).assessment;
            await click('.skill-review-share__button');

            // when
            await visit(`/campagnes/${campaign.code}/evaluation/resultats/${currentAssessment.id}`);

            expect(find('.skill-review-share__thanks')).to.exist;
          });
        });
      });
    });
  });

  describe('Resume 2 campaigns', function() {

    let prescritUserInfo;
    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let campaignParticipation2;

    beforeEach(async function() {
      prescritUserInfo = server.create('user', 'withEmail');
      await authenticateByEmail(prescritUserInfo);
      campaign1 = server.create('campaign', { type: ASSESSMENT }, 'withThreeChallenges');
      campaign2 = server.create('campaign', { type: ASSESSMENT }, 'withThreeChallenges');
      campaignParticipation1 = server.create('campaignParticipation', { campaign: campaign1 }, 'completedWithResults');
      campaignParticipation2 = server.create('campaignParticipation', { campaign: campaign2 }, 'completedWithResults');
    });

    context('When user has finished but not shared 2 campaigns', function() {

      it('should suggest to share his results for the first campaign', async function() {
        // when
        await visit(`/campagnes/${campaign1.code}`);

        expect(find('.skill-review-share__button')).to.exist;
      });

      it('should suggest to share his results for the second campaign', async function() {
        // when
        await visit(`/campagnes/${campaign2.code}`);

        expect(find('.skill-review-share__button')).to.exist;
      });
    });

    context('When user has finished both campaigns but shared only 1 campaign', function() {

      beforeEach(async function() {
        campaignParticipation1.update({ isShared: true });
      });

      it('should show thanks message for the first campaign', async function() {
        // when
        await visit(`/campagnes/${campaign1.code}`);

        // then
        expect(find('.skill-review-share__thanks')).to.exist;
      });

      it('should suggest to share his results for the second campaign', async function() {
        // when
        await visit(`/campagnes/${campaign2.code}`);

        // then
        expect(find('.skill-review-share__button')).to.exist;
      });
    });

    context('When user has finished and shared both campaigns', function() {

      beforeEach(async function() {
        campaignParticipation1.update({ isShared: true });
        campaignParticipation2.update({ isShared: true });
      });

      it('should show thanks message for the first campaign', async function() {
        // when
        await visit(`/campagnes/${campaign1.code}`);

        expect(find('.skill-review-share__thanks')).to.exist;
      });

      it('should show thanks message for the second campaign', async function() {
        // when
        await visit(`/campagnes/${campaign2.code}`);

        expect(find('.skill-review-share__thanks')).to.exist;
      });
    });
  });
});
