const Skill = require('../../domain/models/Skill');

module.exports = {

  fromAirtableDataObject(skillAirtableDataObject) {
    return new Skill({
      id: skillAirtableDataObject.id,
      name: skillAirtableDataObject.name,
      pixValue: skillAirtableDataObject.pixValue,
      competenceId: skillAirtableDataObject.competenceId,
      tutorialIds: skillAirtableDataObject.tutorialIds,
      tubeId: skillAirtableDataObject.tubeId,
    });
  },
};
