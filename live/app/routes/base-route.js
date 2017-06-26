import Ember from 'ember';

export default Ember.Route.extend({

  //Toutes les pages reset le scroll par défaut (surcharger scrollToTop dans une route si on ne veut pas de scrollReset)
  scrollsToTop: true,

  activate() {
    this._super();
    if (this.get('scrollsToTop')) {
      window.scrollTo(0, 0);
    }
  }
});
