const BookshelfSkill = require('../../infrastructure/data/skill');
const Skill = require('../../domain/models/Skill');
const Bookshelf = require('../../infrastructure/bookshelf');
const airtable = require('../airtable');

function _toDomain(airtableSkill) {
  return new Skill({
    name: airtableSkill.get('Nom')
  });
}

module.exports = {

  findByCompetence(competence) {
    const query = {
      filterByFormula: `FIND('${competence.index}', {Compétence})`
    };
    return airtable.findRecords('Acquis', query)
      .then((skills) => {
        return skills.map(_toDomain);
      });
  },

  save(arraySkills) {
    const SkillCollection = Bookshelf.Collection.extend({
      model: BookshelfSkill
    });
    return SkillCollection.forge(arraySkills)
      .invokeThen('save');
  }
};
