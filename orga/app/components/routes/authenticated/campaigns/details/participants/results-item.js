import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  progressBarStyle: computed('campaignParticipation.campaignParticipationResult.percentageProgression', function() {
    return htmlSafe(`width: ${this.campaignParticipation.campaignParticipationResult.get('percentageProgression')}px`);
  }),
});
