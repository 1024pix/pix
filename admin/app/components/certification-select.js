import Component from '@ember/component';

export default Component.extend({

  // Actions
  actions: {
    onChange() {
      this.select(this.id);
    }
  }
});
