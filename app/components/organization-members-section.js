import Component from '@ember/component';

export default Component.extend({

  actions: {
    addMembership() {
      return this.get('onMembershipAdded')();
    }
  }
});
