import Ember from 'ember';

export default Ember.Service.extend({
  hide() {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.remove();
    }
  }
});
