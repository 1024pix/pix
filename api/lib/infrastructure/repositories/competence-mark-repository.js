const BookshelfCompetenceMark = require('../data/competence-mark');

module.exports = {
  save: (competenceMark) => {
    return competenceMark.validate()
      .then(() => new BookshelfCompetenceMark(competenceMark).save())
      .then(savedCompetenceMark => savedCompetenceMark.toDomainEntity());
  }
};
