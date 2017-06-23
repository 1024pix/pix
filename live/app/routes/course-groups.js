import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model() {
    return this.get('store').findAll('courseGroup');
  }
});
