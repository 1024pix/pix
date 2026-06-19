import Route from '@ember/routing/route';

export default class UserCguRoute extends Route {
  async model() {
    const user = this.modelFor('authenticated.users.get');
    return {
      pixAppTermsOfServiceAccepted: user.pixAppTermsOfServiceAccepted,
      pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
      pixCertifTermsOfServiceAccepted: user.pixCertifTermsOfServiceAccepted,
      lastPixAppTermsOfServiceValidatedAt: user.lastPixAppTermsOfServiceValidatedAt,
      lastPixOrgaTermsOfServiceValidatedAt: user.lastPixOrgaTermsOfServiceValidatedAt,
      lastPixCertifTermsOfServiceValidatedAt: user.lastPixCertifTermsOfServiceValidatedAt,
    };
  }
}
