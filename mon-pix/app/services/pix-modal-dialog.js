import Service from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default Service.extend({

  enableScrolling() {
    if (ENV.environment !== 'test') {
      document.querySelector('#modal-overlays').classList.add('active');
      document.body.classList.add('centered-modal-showing');
    }
  },

  disableScrolling() {
    if (ENV.environment !== 'test') {
      document.querySelector('#modal-overlays').classList.remove('active');
      document.body.classList.remove('centered-modal-showing');
    }
  },

});
