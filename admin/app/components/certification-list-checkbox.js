import Component from '@ember/component';

export default Component.extend({
  actions: {
    onClick(index, record) {
      this.clickOnRow(index, record);
    }
  }
});
