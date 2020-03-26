import { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class NavbarBurgerMenu extends Component {
  @service currentUser;

  showUserTutorialsInMenu = config.APP.FT_ACTIVATE_USER_TUTORIALS
}
