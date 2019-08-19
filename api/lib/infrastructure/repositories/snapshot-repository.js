const BookshelfSnapshot = require('../data/snapshot');
const queryBuilder = require('../utils/query-builder');

module.exports = {
  find(options) {
    return queryBuilder.find(BookshelfSnapshot, options);
  },
};
