import Route from '@ember/routing/route';

export default class PreselectTargetProfileRoute extends Route {
  model(params) {
    return this.store.query('tube', {
      filter: {
        name: params.name,
      },
    });
  }
}
