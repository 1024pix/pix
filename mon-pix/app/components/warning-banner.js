import Component from '@ember/component';
import ENV from 'mon-pix/config/environment';

export default Component.extend({
  isEnabled: ENV.APP.IS_WARNING_BANNER_ENABLED
});
