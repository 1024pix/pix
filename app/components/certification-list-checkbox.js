import Component from '@ember/component';

export default Component.extend({
  actions: {
    onClick(index, record) {
      this.get('clickOnRow')(index, record);
    }
  }
});
