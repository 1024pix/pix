import Route from '@ember/routing/route';

export default class PreselectTargetProfileRoute extends Route {
  model() {
    return this.store.query('area', {});
  }
}
