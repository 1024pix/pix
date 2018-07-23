import CertificationInfoField from './certification-info-field';

export default CertificationInfoField.extend({
  values:null,

  init() {
    this._super(...arguments);
    this.set('values', []);
  },

  actions: {
    selectOption(value) {
      this.set('value', value);
    }
  }

});
