import Service from '@ember/service';

export default Service.extend({

  enableScrolling() {
    document.querySelector('#modal-overlays').classList.add('active');
    document.body.classList.add('centered-modal-showing');
  },

  disableScrolling() {
    document.querySelector('#modal-overlays').classList.remove('active');
    document.body.classList.remove('centered-modal-showing');
  },

});
