import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | campaign-analysis', function(hooks) {
  setupTest(hooks);
  module('sortedCampaignTubeRecommendations', function() {

    test('it orders campaign tube recommendation by average score', async function(assert) {
      const store = this.owner.lookup('service:store');
      const campaignAnalysis = store.createRecord('campaign-analysis', {});
      campaignAnalysis.set('campaignTubeRecommendations', [
        store.createRecord('campaign-tube-recommendation', { averageScore: 30 }),
        store.createRecord('campaign-tube-recommendation', { averageScore: 10 }),
        store.createRecord('campaign-tube-recommendation', { averageScore: 15 })
      ]);

      const sortedRecommendationsScore = campaignAnalysis.sortedCampaignTubeRecommendations.map(({ averageScore }) => averageScore);
      assert.deepEqual(sortedRecommendationsScore, [10, 15, 30]);
    });
  });
});
