const bookshelfToDomainConverter = require('../../../lib/infrastructure/utils/bookshelf-to-domain-converter');
const CertificationChallengeBookshelf = require('../../../lib/infrastructure/data/certification-challenge');
const KnowledgeElementBookshelf = require('../../../lib/infrastructure/data/knowledge-element');

const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');

const _ = require('lodash');

async function findDirectAndHigherLevelKEs({ userId }) {
  const KEs = await KnowledgeElementBookshelf
    .where({
      userId,
      source: KnowledgeElement.SourceType.DIRECT,
      status: KnowledgeElement.StatusType.VALIDATED })
    .fetchAll();
  return KEs.map((ke) => bookshelfToDomainConverter.buildDomainObject(KnowledgeElementBookshelf, ke));
}

async function getAllTestedChallenges({ courseId }) {
  // id, associatedSkillName, associatedSkillId, challengeId, competenceId
  const challengeList = await CertificationChallengeBookshelf
    .where({ courseId })
    .fetchAll();
  return challengeList.map((challenge) => bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, challenge));
}

function mergeTestedChallengesAndKEsByCompetences({KEs, challengesTestedInCertif}) {
  // On trie les KE par competence
  const keGroupedByCompetences = _.groupBy(KEs, 'competenceId');

  // Pour chaque competence 
  const keAndCertifChallengePerCompetence = _.map(keGroupedByCompetences, (KEs, competenceId) => {

    // On trie les KE par skill (acquis)
    const keGroupBySkill = _.groupBy(KEs, 'skillId');

    // Pour chaque skill
    const keGroup = _.map(keGroupBySkill, (KEs, skillId) => {

      // On va chercher si le challenge a été demandé en test de certification
      const mbTestedChallenge = _.find(challengesTestedInCertif, (challenge) => {
        // TODO: chercher parmi tous les KEs ! (mais pour le moment on a qu'un KE par skill)
        return challenge.associatedSkillId === skillId
      });
      
      // On fusionne les informations obtenues
      // todo: refacto
      const userSkillProfile = new UserSkillProfile({
        id: skillId,
        KEsForThisSkill: KEs,
        mbTestedChallenge,
      });
      return userSkillProfile;
    });
    return { competenceId, skills: keGroup };
  });
  
  return keAndCertifChallengePerCompetence;
}

async function mergeCompetencesWithReferentialInfos({ competences }) {
  const competencesInfos = await competenceRepository.listPixCompetencesOnly();

  // Ajout des infos pour les compétences
  let competencesWithInfos = await Promise.all(_.map((competences), async (competence) => {
    const competenceWithInfos = _.find((competencesInfos), (comp) => comp.id === competence.competenceId);
    competenceWithInfos.positionnedSkills = competence.skills;
    delete competenceWithInfos.description;
    delete competenceWithInfos.skillIds;
    delete competenceWithInfos.level;
    competenceWithInfos.activeSkillsIds = await skillRepository.findActiveByCompetenceId(competence.competenceId)
    competenceWithInfos.operativeSkillsIds = await skillRepository.findOperativeByCompetenceId(competence.competenceId)
    return competenceWithInfos;
  }));

  // Ajout des infos pour les skills
  competencesWithInfos = _.map((competencesWithInfos), (competence) => {
    const allSkillsForThisCompetence = competence.operativeSkillsIds;
    competence.positionnedSkills = _.map((competence.positionnedSkills), (positionnedSkill) => {
      const skillFound = _.find((allSkillsForThisCompetence), (skill) => skill.id === positionnedSkill.id);
      positionnedSkill.name = skillFound && skillFound.name;
      positionnedSkill.pixValue = skillFound && skillFound.pixValue;
      positionnedSkill.competenceId = skillFound && skillFound.competenceId;
      positionnedSkill.tutorialIds = skillFound && skillFound.tutorialIds;
      positionnedSkill.tubeId = skillFound && skillFound.tubeId;
      return positionnedSkill;
    });
    return competence;
  });

  // Tri de TOUS les operatives skills par tubes
  competencesWithInfos = _.map((competencesWithInfos), (competence) => {
    // Regroupement des skills par tubes
    competence.tubes = _.groupBy((competence.operativeSkillsIds), 'tubeId');
    // Tris des skills dans les tubes
    competence.tubes = _.map((competence.tubes), (tube) => {
      return _.sortBy(tube, 'name');
    });
    return competence;
  });

  // Ajout des infos pour les tubes
  competencesWithInfos = await Promise.all(_.map((competencesWithInfos), async (competence) => {
    competence.tubes = await Promise.all(_.map(competence.tubes, async (tube) => {
      const firstSkill = tube[0];
      const tubeId = firstSkill.tubeId; // tous les skills de ce tube on le même tubeId
      const tubeWithInfos = await tubeRepository.get(tubeId);
      delete tubeWithInfos.title;
      delete tubeWithInfos.practicalTitle;
      delete tubeWithInfos.description;
      delete tubeWithInfos.practicalDescription;
      tubeWithInfos.skills = tube;
      return tubeWithInfos;
    }));
    return competence;
  }));

  // Ajout du label positionned pour les skills
  competencesWithInfos = _.map((competencesWithInfos), (competence) => {
    const positionnedSkills = competence.positionnedSkills;
    competence.tubes = _.map(competence.tubes, (tube) => {
      tube.skills = _.map(tube.skills, (skill) => {
        const mbPositionnedSkill = _.find((positionnedSkills), skill);
        skill.isPositionned = Boolean(mbPositionnedSkill);
        skill.mbTestedChallenge = mbPositionnedSkill && mbPositionnedSkill.mbTestedChallenge;
        // TODO : rajouter skill.isActive
        return skill;
      });
      return tube;
    });
    return competence;
  });

  return competencesWithInfos;
}

module.exports = {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  mergeTestedChallengesAndKEsByCompetences,
  mergeCompetencesWithReferentialInfos,
}