import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return params.campaign_code;
  },
});
