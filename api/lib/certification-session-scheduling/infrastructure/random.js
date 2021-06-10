const _ = require('lodash');

module.exports = {
  pickOneFrom: (items) => {
    return _.sample(items);
  },
};
