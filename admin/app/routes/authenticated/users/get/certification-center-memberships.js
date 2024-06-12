import Route from '@ember/routing/route';

export default class UserCertificationCenterMemberships extends Route {
  async model() {
    const user = this.modelFor('authenticated.users.get');
    const certificationCenterMemberships = await user.certificationCenterMemberships;
    return certificationCenterMemberships;
  }
}
