import Route from '@ember/routing/route';

export default Route.extend({
  deactivate: function() {
    this.controller.set('campaignCode', null);
  },
});
