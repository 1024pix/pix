import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  afterModel(model) {
    if (model.get('isCertification')) {
      this.transitionTo('index');
    }
  },

});
