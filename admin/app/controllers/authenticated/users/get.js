import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class GetController extends Controller {

  @action
  async removeAuthenticationMethod(type) {
    await this.model.save({ adapterOptions: { removeAuthenticationMethod: true, type } });
    this.send('refreshModel');
  }
}
