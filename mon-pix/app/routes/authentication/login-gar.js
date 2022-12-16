import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PixWindow from 'mon-pix/utils/pix-window';

export default class LoginGarRoute extends Route {
  @service session;

  async beforeModel() {
    const token = decodeURIComponent(PixWindow.getLocationHash().slice(1));
    await this.session.authenticate('authenticator:gar', token);
  }
}
