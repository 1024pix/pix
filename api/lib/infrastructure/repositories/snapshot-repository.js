const BookshelfSnapshot = require('../data/snapshot');
const queryBuilder = require('../utils/query-builder');

module.exports = {
  save(snapshotRawData) {
    return new BookshelfSnapshot(snapshotRawData).save();
  },

  find(options) {
    return queryBuilder.find(BookshelfSnapshot, options);
  },
};
