import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Mixin.create({

  _valueAsArrayOfBoolean: Ember.computed('value', function () {
    let result = [];

    const currentValue = this.get('value');

    if (_.isString(currentValue) && currentValue.length > 0) {
      const arrayValues = currentValue.split(',');
      const rawValues = _.map(arrayValues, (rawValue) => rawValue - 1);
      const maxValue = _.max(rawValues) + 1;

      result = _.range(maxValue).map(() => false );

      _.each(rawValues, (rawValue) => {
        result[rawValue] = true;
      });
    }

    return result;
  })

});

