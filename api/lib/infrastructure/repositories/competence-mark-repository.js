const CompetenceMark = require('../../domain/models/CompetenceMark');
const BookshelfCompetenceMark = require('../data/competence-mark');

function _toDomain(bookshelfModel) {
  return new CompetenceMark(bookshelfModel.toJSON());
}

module.exports = {
  save: (competenceMark) => {
    return competenceMark.validate()
      .then(() => new BookshelfCompetenceMark(competenceMark).save().then(_toDomain));
  }
};
