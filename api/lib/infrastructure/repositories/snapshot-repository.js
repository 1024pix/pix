const BookshelfSnapshot = require('../data/snapshot');
const QueryBuilder = require('../utils/query-builder');

module.exports = {
  save(snapshotRawData) {
    return new BookshelfSnapshot(snapshotRawData).save();
  },

  find(options) {
    return QueryBuilder.find(BookshelfSnapshot, options);
  },
};
