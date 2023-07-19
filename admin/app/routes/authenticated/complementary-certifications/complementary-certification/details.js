import Route from '@ember/routing/route';

export default class ComplementaryCertificationDetailsRoute extends Route {
  async model() {
    return this.modelFor('authenticated.complementary-certifications.complementary-certification');
  }
}
