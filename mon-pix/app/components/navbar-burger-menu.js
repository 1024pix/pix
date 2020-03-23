import Component from '@ember/component';
import { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';

export default Component.extend({
  currentUser: service(),

  showUserTutorialsInMenu: config.APP.FT_ACTIVATE_USER_TUTORIALS
});
