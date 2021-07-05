import Route from '@ember/routing/route';

export default class CertificationCandidatesRoute extends Route {
  async model() {
    const details = await this.modelFor('authenticated.sessions.details');
    const countries = await this.store.findAll('country');

    return {
      ...details,
      countries,
    };
  }
}
