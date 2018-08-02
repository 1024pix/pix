import Service from '@ember/service';

export default Service.extend({

  state:null,
  available:false,

  getState() {
    if (this.get('available')) {
      this.set('available', false);
      return this.get('state');
    }
    return false;
  },

  storeState(state) {
    this.set('state', state);
    this.set('available', true);
  },

  hasState() {
    return (this.get('available'));
  }

});
