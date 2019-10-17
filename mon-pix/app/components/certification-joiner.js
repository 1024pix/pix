import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  sessionNumber: 1234,
  firstName: 'Léo',
  lastName: 'John',
  isLoading: false,

  async ensureAccessAllowed() {
    return new Promise((resolve) => setTimeout(() => resolve(true), 1300));
  },
  actions: {
    async attemptNext() {
      this.set('isLoading', true);
      return (await this.ensureAccessAllowed())
        ? this.success()
        : this.fail();
    },
    handleFail() {
      this.set('isLoading', false);
      this.fail();
    }
  }
});
