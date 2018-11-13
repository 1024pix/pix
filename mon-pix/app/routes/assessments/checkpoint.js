import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

  afterModel(assessment) {

    return RSVP.hash({
      campaigns: this.get('store').query('campaign', { filter: { code: assessment.codeCampaign } }),
      skillReview: assessment.belongsTo('skillReview').reload()
    }).then((hash) => {
      assessment.set('campaign', hash.campaigns.get('firstObject'));
      return assessment;
    });
  },

});
