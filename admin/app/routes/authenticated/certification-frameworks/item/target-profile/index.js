import Route from '@ember/routing/route';

export default class TargetProfileIndexRoute extends Route {
  async model() {
    const { currentComplementaryCertification } = await this.modelFor(
      'authenticated.certification-frameworks.item.target-profile',
    );
    await currentComplementaryCertification.reload();
    return currentComplementaryCertification;
  }
}
