const Mark = require('../../domain/models/Mark');
const BookshelfMark = require('../data/mark');

function _toDomain(bookshelfModel) {
  return new Mark(bookshelfModel.toJSON());
}

module.exports = {
  save: (mark) => {
    return new BookshelfMark(mark).save().then(_toDomain);
  }
};
