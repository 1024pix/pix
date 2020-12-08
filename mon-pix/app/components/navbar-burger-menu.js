/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class NavbarBurgerMenu extends Component {
  @service currentUser;

  get showDashboard() {
    return ENV.APP.FT_DASHBOARD;
  }
}
