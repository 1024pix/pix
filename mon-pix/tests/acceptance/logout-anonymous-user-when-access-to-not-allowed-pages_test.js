import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const EXPECTED_ROUTE_CAMPAIGN = '/campagnes';
const SIMPLIFIED_CODE_CAMPAIGN = 'SIMPLIFIE';
const ID_ASSESSMENT = '10000029';

module('Acceptance | Campaigns | Simplified access | Anonymous user access to not allowed pages', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let campaign;

  module('When user logged as anonymous, and the access to campaign is simplified', function (hooks) {
    hooks.beforeEach(async function () {
      campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
      await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaign.code });
    });

    module('When access to not allowed profil page', function () {
      test('should logout anonymous user and redirect to campaign page', async function (assert) {
        // when
        await visit('/competences');

        // then
        assert.strictEqual(currentURL(), EXPECTED_ROUTE_CAMPAIGN);
        assert.false(currentSession(this.application).get('isAuthenticated'));
      });
    });

    module('When access to allowed pages #', function () {
      // to reduce acceptance time test, we test multiple routes in the same test
      test('should access to the page', async function (assert) {
        // when
        const CAMPAIGN_RESULT_ROUTE = `/campagnes/${SIMPLIFIED_CODE_CAMPAIGN}/evaluation/resultats`;
        await visit(CAMPAIGN_RESULT_ROUTE);

        // then
        assert.strictEqual(currentURL(), CAMPAIGN_RESULT_ROUTE);
        assert.true(currentSession(this.application).get('isAuthenticated'));

        // when
        const CHALLENGE_ROUTE = `/assessments/${ID_ASSESSMENT}/challenges/0`;
        await visit(`${CHALLENGE_ROUTE}`);
        // then
        assert.strictEqual(currentURL(), CHALLENGE_ROUTE);
        assert.true(currentSession(this.application).get('isAuthenticated'));

        // when
        const CAMPAIGN_DIDACTICIEL_ROUTE = `/campagnes/${SIMPLIFIED_CODE_CAMPAIGN}/evaluation/didacticiel`;
        await visit(CAMPAIGN_DIDACTICIEL_ROUTE);

        // then
        assert.strictEqual(currentURL(), CAMPAIGN_DIDACTICIEL_ROUTE);
        assert.true(currentSession(this.application).get('isAuthenticated'));

        // when
        const CAMPAIGN_ROUTE = `/campagnes/${SIMPLIFIED_CODE_CAMPAIGN}`;
        await visit(CAMPAIGN_ROUTE);

        // then
        assert.strictEqual(currentURL(), CAMPAIGN_ROUTE);
        assert.true(currentSession(this.application).get('isAuthenticated'));
      });
    });
  });
});
