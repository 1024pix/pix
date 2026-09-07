import Joi from 'joi';

export default Joi.extend({
  type: /.*/,
  rules: {
    requiredForMaddo: {
      method() {
        return this.when('MADDO', { is: true, then: this.required(), otherwise: this });
      },
    },
    requiredForApi: {
      method() {
        return this.when('MADDO', { is: false, then: this.required(), otherwise: this });
      },
    },
  },
});
