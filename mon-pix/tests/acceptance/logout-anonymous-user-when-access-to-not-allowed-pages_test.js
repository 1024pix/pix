import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { currentSession } from 'ember-simple-auth/test-support';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const EXPECTED_ROUTE_CAMPAIGN = '/campagnes';
const SIMPLIFIED_CODE_CAMPAIGN = 'SIMPLIFIE';
const ID_ASSESSMENT = '10000029';
const CODE_CHALLENGE = 'rec1lRuv6iIYn5Ek2';

describe('Acceptance | Campaigns | Simplified access | Anonymous user access to not allowed pages', function() {

  setupApplicationTest();
  setupMirage();
  let campaign;

  context('When user logged as anonymous, and the access to campaign is simplified', () => {

    beforeEach(async () => {
      campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
      await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaign.code });
    });

    describe('When access to not allowed profil page', function() {

      it('should logout anonymous user and redirect to campaign page', async function() {

        // when
        await visit('/competences');

        // then
        expect(currentURL()).to.equal(EXPECTED_ROUTE_CAMPAIGN);
        expect(currentSession(this.application).get('isAuthenticated')).to.be.false;
      });
    });

    describe('When access to allowed pages #', function() {

      // to reduce acceptance time test, we test multiple routes in the same test
      it('should access to the page', async function() {

        // when
        const CAMPAIGN_RESULT_ROUTE = `/campagnes/${SIMPLIFIED_CODE_CAMPAIGN}/evaluation/resultats/${ID_ASSESSMENT}`;
        await visit(CAMPAIGN_RESULT_ROUTE);
        // then
        expect(currentURL()).to.equal(CAMPAIGN_RESULT_ROUTE);
        expect(currentSession(this.application).get('isAuthenticated')).to.be.true;

        // when
        const CHALLENGE_ROUTE = `/assessments/${ID_ASSESSMENT}/challenges/${CODE_CHALLENGE}`;
        await visit(`${CHALLENGE_ROUTE}`);
        // then
        expect(currentURL()).to.equal(CHALLENGE_ROUTE);
        expect(currentSession(this.application).get('isAuthenticated')).to.be.true;

        // when
        const CAMPAIGN_DIDACTICIEL_ROUTE = `campagnes/${SIMPLIFIED_CODE_CAMPAIGN}/evaluation/didacticiel`;
        await visit(CAMPAIGN_DIDACTICIEL_ROUTE);
        // then
        expect(currentURL()).to.equal(CAMPAIGN_DIDACTICIEL_ROUTE);
        expect(currentSession(this.application).get('isAuthenticated')).to.be.true;

        // when
        const CAMPAIGN_ROUTE = `campagnes/${SIMPLIFIED_CODE_CAMPAIGN}`;
        await visit(CAMPAIGN_ROUTE);
        // then
        expect(currentURL()).to.equal(CAMPAIGN_ROUTE);
        expect(currentSession(this.application).get('isAuthenticated')).to.be.true;

      });
    });

  });

});
