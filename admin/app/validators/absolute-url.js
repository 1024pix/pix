import FormatValidator from 'ember-cp-validations/validators/format';

const AbsoluteUrl = FormatValidator.extend({
  validate(value, options, model, attribute) {
    if (value && !(value.startsWith('http://') || value.startsWith('https://'))) {
      return options.message;
    }
    return this._super(value, { ...options, type: 'url' }, model, attribute);
  },
});

AbsoluteUrl.reopenClass({
  /**
   * Define attribute specific dependent keys for your validator
   *
   * [
   * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
   * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
   * ]
   *
   * @param {String}  attribute   The attribute being evaluated
   * @param {Unknown} options     Options passed into your validator
   * @return {Array}
   */
  getDependentsFor(/* attribute, options */) {
    return [];
  },
});

export default AbsoluteUrl;
