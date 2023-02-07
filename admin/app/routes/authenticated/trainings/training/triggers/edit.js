import Route from '@ember/routing/route';

export default class EditTriggerRoute extends Route {
  model() {
    return this.modelFor('authenticated.trainings.training');
  }
}
