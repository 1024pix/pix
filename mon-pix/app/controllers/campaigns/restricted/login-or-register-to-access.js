import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginOrRegisterToAccessRoute extends Controller {

  @service currentUser;
  @service session;

  @tracked displayRegisterForm = true;

  queryParams = ['displayRegisterForm'];

  @action
  toggleFormsVisibility() {
    this.displayRegisterForm = !this.displayRegisterForm;
  }

  @action
  async addGarAuthenticationMethodToUser(externalUserToken, expectedUserId) {
    await this.currentUser.load();
    await this.currentUser.user.save({
      adapterOptions: {
        authenticationMethodsSaml: true,
        externalUserToken,
        expectedUserId,
      },
    });

    this.session.set('data.externalUser', null);
    this.session.set('data.expectedUserId', null);

    this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { associationDone: true, participantExternalId: this.participantExternalId },
    });
  }

}
