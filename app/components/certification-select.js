import Component from '@ember/component';

export default Component.extend({
  actions: {
    change() {
      this.get('select')(this.get('id'));
    }
  }
});
