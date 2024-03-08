import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class NewRoute extends Route {
  @service store;

  model() {
    return RSVP.hash({
      certificationCenter: this.store.createRecord('certification-center'),
      habilitations: this.store.findAll('complementary-certification'),
    });
  }
}
