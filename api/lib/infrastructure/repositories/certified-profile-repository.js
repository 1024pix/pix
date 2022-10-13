const { knex } = require('../../../db/knex-database-connection');
const {
  CertifiedProfile,
  CertifiedArea,
  CertifiedCompetence,
  CertifiedTube,
  CertifiedSkill,
} = require('../../domain/read-models/CertifiedProfile');
const { NotFoundError } = require('../../domain/errors');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const learningContentRepository = require('./learning-content-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');

module.exports = {
  async get(certificationCourseId) {
    const certificationDatas = await knex
      .select({
        userId: 'certification-courses.userId',
        createdAt: 'certification-courses.createdAt',
        skillId: 'certification-challenges.associatedSkillId',
      })
      .from('certification-courses')
      .join('certification-challenges', 'certification-challenges.courseId', 'certification-courses.id')
      .where('certification-courses.id', certificationCourseId);

    if (certificationDatas.length === 0) {
      throw new NotFoundError(`Test de certification ${certificationCourseId} n'existe pas`);
    }
    const userId = certificationDatas[0].userId;
    const createdAt = certificationDatas[0].createdAt;
    const askedInCertificationSkillIds = certificationDatas.map((data) => data.skillId);

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId,
      limitDate: createdAt,
    });

    const isKnowledgeElementValidated = (knowledgeElement) => knowledgeElement.status === 'validated';
    const allUserProfileSkillIds = knowledgeElements
      .filter((knowledgeElement) => isKnowledgeElementValidated(knowledgeElement))
      .map((pixKnowledgeElement) => pixKnowledgeElement.skillId);

    const learningContent = await learningContentRepository.buildFromSkillIds(allUserProfileSkillIds, FRENCH_FRANCE);
    const certifiedSkills = await _createCertifiedSkills(learningContent, askedInCertificationSkillIds);
    const certifiedTubes = await _createCertifiedTubes(learningContent);
    const certifiedCompetences = await _createCertifiedCompetences(learningContent);
    const certifiedAreas = await _createCertifiedAreas(learningContent);

    return new CertifiedProfile({
      id: certificationCourseId,
      userId,
      certifiedAreas,
      certifiedCompetences,
      certifiedTubes,
      certifiedSkills,
    });
  },
};

async function _createCertifiedSkills(learningContent, askedInCertificationSkillIds) {
  return learningContent.skills.map((learningContentSkill) => {
    return new CertifiedSkill({
      id: learningContentSkill.id,
      name: learningContentSkill.name,
      hasBeenAskedInCertif: askedInCertificationSkillIds.includes(learningContentSkill.id),
      tubeId: learningContentSkill.tubeId,
      difficulty: learningContentSkill.difficulty,
    });
  });
}

async function _createCertifiedTubes(learningContent) {
  return learningContent.tubes.map((learningContentTube) => {
    return new CertifiedTube({
      id: learningContentTube.id,
      name: learningContentTube.practicalTitle,
      competenceId: learningContentTube.competenceId,
    });
  });
}

async function _createCertifiedCompetences(learningContent) {
  return learningContent.competences.map((learningContentCompetence) => {
    return new CertifiedCompetence({
      id: learningContentCompetence.id,
      name: learningContentCompetence.name,
      areaId: learningContentCompetence.areaId,
      origin: learningContentCompetence.origin,
    });
  });
}

async function _createCertifiedAreas(learningContent) {
  return learningContent.areas.map((learningContentArea) => {
    return new CertifiedArea({
      id: learningContentArea.id,
      name: learningContentArea.title,
      color: learningContentArea.color,
    });
  });
}
