import BaseRoute from 'pix-live/routes/base-route';
import { next } from '@ember/runloop';

export default BaseRoute.extend({

  model(params) {
    return this.get('store')
      .findRecord('assessment', params.assessment_id);
  },
});
