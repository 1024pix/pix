import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

  afterModel(assessment) {

    if (assessment.isCompetenceEvaluation) {
      return assessment.belongsTo('progression').reload();
    }

    if (assessment.isSmartPlacement) {
      return RSVP.hash({
        campaigns: this.store.query('campaign', { filter: { code: assessment.codeCampaign } }),
        progression: assessment.belongsTo('progression').reload()
      }).then((hash) => {
        assessment.set('campaign', hash.campaigns.get('firstObject'));
        return assessment;
      });
    }
  },

});
