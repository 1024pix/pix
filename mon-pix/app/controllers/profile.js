import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default class ProfileController extends Controller {
  get isDashboardEnabled() {
    return ENV.APP.FT_DASHBOARD;
  }
}
