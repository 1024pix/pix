import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import config from 'mon-pix/config/environment';

export default Controller.extend({
  currentUser: service(),
  isNewCertificationStartActive: config.APP.isNewCertificationStartActive,
});
