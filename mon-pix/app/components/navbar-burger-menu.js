/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class NavbarBurgerMenu extends Component {
  @service currentUser;

  get showDashboard() {
    return ENV.APP.FT_DASHBOARD;
  }
}
