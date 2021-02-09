import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class JoinRestrictedCampaignController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;

  @service session;
  @service currentUser;

  @action
  async reconcile(schoolingRegistration, adapterOptions) {
    const mustNotRedirectAfterSave = adapterOptions.withReconciliation === false;
    await schoolingRegistration.save({ adapterOptions });

    if (mustNotRedirectAfterSave) {
      return;
    }

    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { associationDone: true, participantExternalId: this.participantExternalId },
    });
  }

  @action
  async createAndReconcile(externalUser) {
    const response = await externalUser.save();

    this.session.set('data.externalUser', null);

    // Needed to avoid ember-simple-auth from redirecting to routeAfterAuthentication (ie /profil) after authentication
    // https://github.com/simplabs/ember-simple-auth/blob/e88f1c163e5e9c7a8524bdfca115843d30128a86/addon/mixins/application-route-mixin.js#L104-L112
    this.session.set('attemptedTransition', { retry: () => {} });

    await this.session.authenticate('authenticator:oauth2', { token: response.accessToken });
    await this.currentUser.load();

    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { associationDone: true, participantExternalId: this.participantExternalId },
    });
  }
}
