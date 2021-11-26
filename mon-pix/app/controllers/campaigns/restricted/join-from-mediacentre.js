import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class JoinFromMediacentreController extends Controller {
  @service session;
  @service currentUser;
  @service campaignStorage;

  @action
  async createAndReconcile(externalUser) {
    const response = await externalUser.save();

    this.session.set('data.externalUser', null);

    await this.session.authenticate('authenticator:oauth2', { token: response.accessToken });
    await this.currentUser.load();

    this.campaignStorage.set(this.model.code, 'associationDone', true);
  }
}
