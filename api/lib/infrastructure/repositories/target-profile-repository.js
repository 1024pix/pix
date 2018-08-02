const TargetProfile = require('../../domain/models/TargetProfile');
const BookshelfTargetProfile = require('../../infrastructure/data/target-profile');

const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const Skill = require('../../domain/models/Skill');

function _toDomain(targetProfileBookshelf) {
  return new TargetProfile({
    id: targetProfileBookshelf.get('id'),
    name: targetProfileBookshelf.get('name'),
  });
}

function _toDomainSkills(skillsDataObjects) {
  return skillsDataObjects.map((skillDataObject) => {
    return new Skill({
      id : skillDataObject.id,
      name : skillDataObject.name
    });
  })
}

module.exports = {

  getStaticProfile(_targetProfileId) {
    return Promise.resolve(
      new TargetProfile({
        skills: [
          new Skill({ name: '@connectique2' }),
          new Skill({ name: '@connectique3' }),
          new Skill({ name: '@appliOS1' }),
          new Skill({ name: '@recherche1' }),
          new Skill({ name: '@recherche2' }),
          new Skill({ name: '@environnementTravail1' }),
          new Skill({ name: '@environnementTravail2' }),
          new Skill({ name: '@outilsTexte1' }),
          new Skill({ name: '@outilsTexte2' }),
          new Skill({ name: '@copierColler1' }),
          new Skill({ name: '@copierColler2' }),
          new Skill({ name: '@miseEnFormeTttTxt1' }),
          new Skill({ name: '@miseEnFormeTttTxt2' }),
          new Skill({ name: '@form_intero2' }),
          new Skill({ name: '@champsCourriel1' }),
          new Skill({ name: '@Moteur1' }),
          new Skill({ name: '@rechinfo1' }),
          new Skill({ name: '@rechinfo3' }),
          new Skill({ name: '@outilsRS1' }),
          new Skill({ name: '@outilsRS2' }),
          new Skill({ name: '@outilsMessagerie2' }),
          new Skill({ name: '@outilsMessagerie3' }),
          new Skill({ name: '@accesDonnées1' }),
          new Skill({ name: '@accesDonnées2' }),
          new Skill({ name: '@choixmotdepasse1' }),
        ],
      }),
    );
  },

  get(id) {
    return BookshelfTargetProfile
      .where({ id })
      .fetch({ withRelated: ['skillIds']})
      .then(async (foundTargetProfile) => {
        const skillRecordIds = foundTargetProfile.related('skillIds').map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
        const skillAssociatedToTargetProfileWIthName = await skillDatasource.findByRecordIds(skillRecordIds);
        const targetProfile = _toDomain(foundTargetProfile);
        targetProfile.skills = _toDomainSkills(skillAssociatedToTargetProfileWIthName);
        return targetProfile;
      });
  }

};
