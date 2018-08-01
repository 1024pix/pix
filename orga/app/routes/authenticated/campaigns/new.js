import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({

  store: inject(),

  model(){
    return this.get('store').createRecord('campaign');
  }
});
