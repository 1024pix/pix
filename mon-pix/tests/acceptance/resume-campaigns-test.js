import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import {
  authenticateAsSimpleUser,
  resumeCampaignByCode,
  completeCampaignByCode,
  completeCampaignAndSeeResultsByCode
} from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';
import { invalidateSession } from 'mon-pix/tests/helpers/ember-simple-auth';

describe('Acceptance | Campaigns | Resume Campaigns', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Resume 1 campaign', function() {

    beforeEach(async function() {
      await authenticateAsSimpleUser();
      await resumeCampaignByCode('AZERTY1', true);
    });

    context('When the user is not logged', function() {

      beforeEach(async function() {
        invalidateSession(application);
        await visit('/campagnes/AZERTY1');
        await click('.campaign-landing-page__start-button');
      });

      it('should propose to signup', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/inscription');
        });
      });

      it('should redirect to assessment when user is signing up', async function() {
        // given
        await fillIn('#firstName', 'Jane');
        await fillIn('#lastName', 'Acme');
        await fillIn('#email', 'jane@acme.com');
        await fillIn('#password', 'Jane1234');
        await click('#pix-cgu');

        // when
        await click('.sign-form__submit-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
          expect(find('.progress-bar-info').text()).to.contains('2/5');
        });
      });

    });

    context('When user is logged', async function() {

      context('When user has started his assessment', async function() {

        it('should redirect directly in assessment', async function() {
          // given
          await visit('/campagnes/AZERTY1');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/assessments/');
            expect(find('.progress-bar-info').text()).to.contains('2/5');
          });
        });
      });

      context('When user has completed his assessment', async function() {

        it('should show the last checkpoint page', async function() {
          // given
          await completeCampaignByCode('AZERTY1');

          // when
          await visit('/campagnes/AZERTY1');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('checkpoint?finalCheckpoint=true');
            expect(find('.checkpoint__continue-button').text()).to.contains('Voir mes résultats');
          });
        });

        it('should show the results page when user clicks on "voir mes résultats"', async function() {
          // given
          await completeCampaignByCode('AZERTY1');
          await visit('/campagnes/AZERTY1');

          // when
          await click('.checkpoint__continue-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('resultats');
          });
        });

        context('When user has not shared his results', async function() {

          it('should suggest to share his results', async function() {
            // when
            await completeCampaignAndSeeResultsByCode('AZERTY1');

            // then
            return andThen(() => {
              findWithAssert('.skill-review__share__button');
            });
          });

          it('should thank the user when he clicks on the share button', async function() {
            // when
            await completeCampaignAndSeeResultsByCode('AZERTY1');
            await click('.skill-review__share__button');

            // then
            return andThen(() => {
              findWithAssert('.skill-review__share__thanks');
            });
          });
        });

        context('When user has shared his results', async function() {

          it('should still display thank message when reloading the page', async function() {
            // given
            await completeCampaignAndSeeResultsByCode('AZERTY1');
            await click('.skill-review__share__button');

            // when
            await visit('/campagnes/AZERTY1/resultats/1');

            // then
            return andThen(() => {
              findWithAssert('.skill-review__share__thanks');
            });
          });
        });
      });
    });
  });

  describe('Resume 2 campaigns', function() {

    beforeEach(async function() {
      server.create('assessment', {
        id: 1,
        type: 'SMART_PLACEMENT',
        codeCampaign: 'AZERTY1',
        state: 'completed',
      });

      server.create('assessment', {
        id: 2,
        type: 'SMART_PLACEMENT',
        codeCampaign: 'AZERTY2',
        state: 'completed',
      });

      server.create('campaignParticipation', {
        id: 1,
        isShared: false,
        campaignId: 1,
        assessmentId: 1,
      });

      server.create('campaignParticipation', {
        id: 2,
        isShared: false,
        campaignId: 2,
        assessmentId: 2,
      });

      await authenticateAsSimpleUser();
      await visit('/campagnes/AZERTY1');
      await click('.challenge-actions__action-skip');
      await completeCampaignByCode('AZERTY1');

      await visit('/campagnes/AZERTY2');
      await click('.challenge-actions__action-skip');
      await completeCampaignByCode('AZERTY2');
    });

    context('When user has finished but not shared 2 campaigns', function() {

      it('should suggest to share his results for the first campaign', async function() {
        // when
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          findWithAssert('.skill-review__share__button');
        });
      });

      it('should suggest to share his results for the second campaign', async function() {
        // when
        await visit('/campagnes/AZERTY2');

        // then
        return andThen(() => {
          findWithAssert('.skill-review__share__button');
        });
      });
    });

    context('When user has finished both campaigns but shared only 1 campaign', function() {

      beforeEach(async function() {
        server.create('campaignParticipation', {
          id: 1,
          isShared: true,
          campaignId: 1,
          assessmentId: 1,
        });
      });

      it('should show thanks message for the first campaign', async function() {
        // when
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          findWithAssert('.skill-review__share__thanks');
        });
      });

      it('should suggest to share his results for the second campaign', async function() {
        // when
        await visit('/campagnes/AZERTY2');

        // then
        return andThen(() => {
          findWithAssert('.skill-review__share__button');
        });
      });
    });

    context('When user has finished and shared both campaigns', function() {

      beforeEach(async function() {
        server.create('campaignParticipation', {
          id: 1,
          isShared: true,
          campaignId: 1,
          assessmentId: 1,
        });
        server.create('campaignParticipation', {
          id: 2,
          isShared: true,
          campaignId: 2,
          assessmentId: 2,
        });
      });

      it('should show thanks message for the first campaign', async function() {
        // when
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          findWithAssert('.skill-review__share__thanks');
        });
      });

      it('should show thanks message for the second campaign', async function() {
        // when
        await visit('/campagnes/AZERTY2');

        // then
        return andThen(() => {
          findWithAssert('.skill-review__share__thanks');
        });
      });
    });
  });
});
