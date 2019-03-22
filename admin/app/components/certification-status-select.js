import CertificationInfoField from './certification-info-field';

export default CertificationInfoField.extend({
  actions: {
    selectOption(value) {
      this.set('value', value);
    }
  }
});
