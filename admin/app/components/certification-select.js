import Component from '@ember/component';

export default Component.extend({

  // Actions
  actions: {
    onChange() {
      this.get('select')(this.get('id'));
    }
  }
});
