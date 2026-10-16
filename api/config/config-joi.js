import Joi from 'joi';
import ms from 'ms';

export default Joi.extend({
  type: /.*/,
  messages: {
    'any.duration': '{{#label}} must be a duration readable by ms, such as "100ms" or "5m"',
  },
  rules: {
    duration: {
      validate(value, helpers) {
        const milliseconds = typeof value === 'string' && value !== '' ? ms(value) : undefined;
        return Number.isFinite(milliseconds) && milliseconds >= 0 ? value : helpers.error('any.duration');
      },
    },
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
