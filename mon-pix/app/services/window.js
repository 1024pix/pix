import Service from '@ember/service';

export default Service.extend({

  localStorage: window.localStorage,

  reload(deleteCache) {
    window.location.reload(deleteCache);
  },

});
