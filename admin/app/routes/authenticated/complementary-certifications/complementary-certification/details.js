import Route from '@ember/routing/route';

export default class DetailsRoute extends Route {
  async model() {
    const complementaryCertification = await this.modelFor(
      'authenticated.complementary-certifications.complementary-certification',
    );
    await complementaryCertification.reload();
    return complementaryCertification;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
    }
  }
}
