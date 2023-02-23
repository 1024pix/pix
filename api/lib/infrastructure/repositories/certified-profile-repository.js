const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const {
  CertifiedProfile,
  CertifiedArea,
  CertifiedCompetence,
  CertifiedTube,
  CertifiedSkill,
} = require('../../domain/read-models/CertifiedProfile.js');
const { NotFoundError } = require('../../domain/errors.js');
const skillDatasource = require('../datasources/learning-content/skill-datasource.js');
const tubeDatasource = require('../datasources/learning-content/tube-datasource.js');
const competenceDatasource = require('../datasources/learning-content/competence-datasource.js');
const areaDatasource = require('../datasources/learning-content/area-datasource.js');
const knowledgeElementRepository = require('./knowledge-element-repository.js');

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
    const askedSkillIds = certificationDatas.map((data) => data.skillId);

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId,
      limitDate: createdAt,
    });

    const isKnowledgeElementValidated = (knowledgeElement) => knowledgeElement.status === 'validated';
    const skillIds = knowledgeElements
      .filter((knowledgeElement) => isKnowledgeElementValidated(knowledgeElement))
      .map((pixKnowledgeElement) => pixKnowledgeElement.skillId);

    const certifiedSkills = await _createCertifiedSkills(skillIds, askedSkillIds);
    const certifiedTubes = await _createCertifiedTubes(certifiedSkills);
    const certifiedCompetences = await _createCertifiedCompetences(certifiedTubes);
    const certifiedAreas = await _createCertifiedAreas(certifiedCompetences);

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

async function _createCertifiedSkills(skillIds, askedSkillIds) {
  const learningContentSkills = await skillDatasource.findByRecordIds(skillIds);
  return learningContentSkills.map((learningContentSkill) => {
    return new CertifiedSkill({
      id: learningContentSkill.id,
      name: learningContentSkill.name,
      hasBeenAskedInCertif: askedSkillIds.includes(learningContentSkill.id),
      tubeId: learningContentSkill.tubeId,
      difficulty: learningContentSkill.level,
    });
  });
}

async function _createCertifiedTubes(certifiedSkills) {
  const certifiedSkillsByTube = _.groupBy(certifiedSkills, 'tubeId');
  const learningContentTubes = await tubeDatasource.findByRecordIds(Object.keys(certifiedSkillsByTube));
  return learningContentTubes.map((learningContentTube) => {
    const name = learningContentTube.practicalTitle_i18n.fr;
    return new CertifiedTube({
      id: learningContentTube.id,
      name,
      competenceId: learningContentTube.competenceId,
    });
  });
}

async function _createCertifiedCompetences(certifiedTubes) {
  const certifiedTubesByCompetence = _.groupBy(certifiedTubes, 'competenceId');
  const learningContentCompetences = await competenceDatasource.findByRecordIds(
    Object.keys(certifiedTubesByCompetence)
  );
  return learningContentCompetences.map((learningContentCompetence) => {
    const name = learningContentCompetence.name_i18n.fr;
    return new CertifiedCompetence({
      id: learningContentCompetence.id,
      name,
      areaId: learningContentCompetence.areaId,
      origin: learningContentCompetence.origin,
    });
  });
}

async function _createCertifiedAreas(certifiedCompetences) {
  const certifiedCompetencesByArea = _.groupBy(certifiedCompetences, 'areaId');
  const learningContentAreas = await areaDatasource.findByRecordIds(Object.keys(certifiedCompetencesByArea));
  return learningContentAreas.map((learningContentArea) => {
    const name = learningContentArea.title_i18n.fr;
    return new CertifiedArea({
      id: learningContentArea.id,
      name,
      color: learningContentArea.color,
    });
  });
}
