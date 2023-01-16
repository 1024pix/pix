import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service store;
  model() {
    return RSVP.hash({
      certificationCenter: this.store.createRecord('certification-center'),
      habilitations: this.store.findAll('habilitation'),
    });
  }
}
