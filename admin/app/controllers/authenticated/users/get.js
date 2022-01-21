import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class GetController extends Controller {
  @action
  async removeAuthenticationMethod(type) {
    await this.model.save({ adapterOptions: { removeAuthenticationMethod: true, type } });
    this.send('refreshModel');
  }

  @action
  async addPixAuthenticationMethod(newEmail) {
    await this.model.save({ adapterOptions: { addPixAuthenticationMethod: true, newEmail } });
  }

  @action
  async reassignGarAuthenticationMethod(targetUserId) {
    await this.model.save({ adapterOptions: { reassignGarAuthenticationMethod: true, targetUserId } });
  }
}
