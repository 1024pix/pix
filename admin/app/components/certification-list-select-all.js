import Component from '@ember/component';

export default Component.extend({
  actions: {
    onToggleAllSelection() {
      this.toggleAllSelection();
    }
  }
});
