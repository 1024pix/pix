import Ember from 'ember';

export default Ember.Component.extend({

  init() {
    this._super(...arguments);
    const showOnly = this.get('showOnly');
    try {
      if (showOnly && Number.isInteger( parseInt(showOnly, 10))) {
        this.set('model', this.get('model').slice(0, parseInt(showOnly, 10)));
      }
    } catch(e) {
      // do nothing
    }
  }
  
});
