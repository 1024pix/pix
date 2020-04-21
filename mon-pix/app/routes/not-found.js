import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class NotFoundRoute extends Route {
  afterModel(model, transition) {
    transition.abort();
    this.transitionTo('authenticated');
  }
}
