import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  averageValidatedSkills: computed('campaignCollectiveResults', function() {
    const campaignCompetenceCollectiveResults = this.get('campaignCollectiveResults.campaignCompetenceCollectiveResults');

    return campaignCompetenceCollectiveResults;
  }),
});
