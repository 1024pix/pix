import {
  click,
  fillIn,
  currentURL,
  find,
  findAll
} from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateViaEmail } from '../helpers/authentification';
import {
  completeCampaignAndSeeResultsByCode,
  completeCampaignByCode,
  resumeCampaignByCode
} from '../helpers/campaign';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { invalidateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Campaigns | Resume Campaigns', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Resume 1 campaign', function() {
    let prescritUserInfo;

    beforeEach(async function() {
      prescritUserInfo = server.create('user', 'withEmail');
      await authenticateViaEmail(prescritUserInfo);
      await resumeCampaignByCode('AZERTY1', true);
    });

    context('When the user is not logged', function() {

      beforeEach(async function() {
        await invalidateSession();
        await visitWithAbortedTransition('/campagnes/AZERTY1');
        await click('.campaign-landing-page__start-button');
      });

      it('should propose to signup', function() {
        expect(currentURL()).to.contains('/inscription');
      });

      it('should redirect to assessment when user logs in', async function() {
        // given
        await click('.sign-form-header__subtitle [href="/connexion"]');
        await fillIn('#login', prescritUserInfo.email);
        await fillIn('#password', prescritUserInfo.password);

        // when
        await click('.sign-form-body__bottom-button button');

        // then
        expect(currentURL()).to.contains('/assessments/');
        expect(findAll('.progress-bar-stepnum.active').length).to.equals(2);
      });

    });

    context('When user is logged', async function() {

      context('When user has started his assessment and came back', async function() {

        it('should redirect directly in assessment', async function() {
          // when
          await visitWithAbortedTransition('/campagnes/AZERTY1');

          // then
          expect(currentURL()).to.contains('/assessments/');
          expect(findAll('.progress-bar-stepnum.active').length).to.equals(2);
        });
      });

      context('When user has started his assessment and came back with query params', function() {

        it('should redirect to assessment', async function() {
          // when
          await visitWithAbortedTransition('/campagnes/AZERTY1?participantExternalId=a7Eat01r3');

          // then
          expect(currentURL()).to.contains('/assessments/');
          expect(findAll('.progress-bar-stepnum.active').length).to.equals(2);
        });
      });

      context('When user has completed his assessment', async function() {

        it('should show the last checkpoint page', async function() {
          // given
          await completeCampaignByCode('AZERTY1');

          // when
          await visitWithAbortedTransition('/campagnes/AZERTY1');

          expect(currentURL()).to.contains('checkpoint?finalCheckpoint=true');
          expect(find('.checkpoint__continue-button').textContent).to.contains('Voir mes résultats');
        });

        it('should show the results page when user clicks on "voir mes résultats"', async function() {
          // given
          await completeCampaignByCode('AZERTY1');
          await visitWithAbortedTransition('/campagnes/AZERTY1');

          // when
          await click('.checkpoint__continue-button');

          expect(currentURL()).to.contains('resultats');
        });

        context('When user has not shared his results', async function() {

          it('should suggest to share his results', async function() {
            // when
            await completeCampaignAndSeeResultsByCode('AZERTY1');

            expect(find('.skill-review-share__button')).to.exist;
          });

          it('should thank the user when he clicks on the share button', async function() {
            // when
            await completeCampaignAndSeeResultsByCode('AZERTY1');
            await click('.skill-review-share__button');

            expect(find('.skill-review-share__thanks')).to.exist;
          });
        });

        context('When user has shared his results', async function() {

          it('should still display thank message when reloading the page', async function() {
            // given
            await completeCampaignAndSeeResultsByCode('AZERTY1');
            await click('.skill-review-share__button');

            // when
            await visitWithAbortedTransition('/campagnes/AZERTY1/resultats/1');

            expect(find('.skill-review-share__thanks')).to.exist;
          });
        });
      });
    });
  });

  describe('Resume 2 campaigns', function() {

    let prescritUserInfo;

    beforeEach(async function() {

      this.server.create('assessment', {
        id: 1,
        type: 'SMART_PLACEMENT',
        codeCampaign: 'AZERTY1',
        state: 'completed',
      });

      this.server.create('assessment', {
        id: 2,
        type: 'SMART_PLACEMENT',
        codeCampaign: 'AZERTY2',
        state: 'completed',
      });

      this.server.create('campaignParticipation', {
        id: 1,
        isShared: false,
        campaignId: 1,
        assessmentId: 1,
      });

      this.server.create('campaignParticipation', {
        id: 2,
        isShared: false,
        campaignId: 2,
        assessmentId: 2,
      });

      prescritUserInfo = server.create('user', 'withEmail');
      await authenticateViaEmail(prescritUserInfo);

    });

    context('When user has finished but not shared 2 campaigns', function() {

      it('should suggest to share his results for the first campaign', async function() {
        // when
        await visitWithAbortedTransition('/campagnes/AZERTY1');

        expect(find('.skill-review-share__button')).to.exist;
      });

      it('should suggest to share his results for the second campaign', async function() {
        // when
        await visitWithAbortedTransition('/campagnes/AZERTY2');

        expect(find('.skill-review-share__button')).to.exist;
      });
    });

    context('When user has finished both campaigns but shared only 1 campaign', function() {

      beforeEach(async function() {
        await visitWithAbortedTransition('/campagnes/AZERTY1');
        await click('.skill-review-share__button');
      });

      it('should show thanks message for the first campaign', async function() {
        expect(find('.skill-review-share__thanks')).to.exist;
      });

      it('should suggest to share his results for the second campaign', async function() {
        // when
        await visitWithAbortedTransition('/campagnes/AZERTY2');

        expect(find('.skill-review-share__button')).to.exist;
      });
    });

    context('When user has finished and shared both campaigns', function() {

      beforeEach(async function() {
        this.server.create('campaignParticipation', {
          id: 1,
          isShared: true,
          campaignId: 1,
          assessmentId: 1,
        });
        this.server.create('campaignParticipation', {
          id: 2,
          isShared: true,
          campaignId: 2,
          assessmentId: 2,
        });
      });

      it('should show thanks message for the first campaign', async function() {
        // when
        await visitWithAbortedTransition('/campagnes/AZERTY1');

        expect(find('.skill-review-share__thanks')).to.exist;
      });

      it('should show thanks message for the second campaign', async function() {
        // when
        await visitWithAbortedTransition('/campagnes/AZERTY2');

        expect(find('.skill-review-share__thanks')).to.exist;
      });
    });
  });
});
