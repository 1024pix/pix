import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import {
  CertifiedArea,
  CertifiedCompetence,
  CertifiedProfile,
  CertifiedSkill,
  CertifiedTube,
} from '../../domain/read-models/CertifiedProfile.js';

const get = async function (certificationCourseId) {
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
};

export { get };

async function _createCertifiedSkills(skillIds, askedSkillIds) {
  const skills = await skillRepository.findByRecordIds(skillIds);
  return skills.map((skill) => {
    return new CertifiedSkill({
      id: skill.id,
      name: skill.name,
      hasBeenAskedInCertif: askedSkillIds.includes(skill.id),
      tubeId: skill.tubeId,
      difficulty: skill.difficulty,
    });
  });
}

async function _createCertifiedTubes(certifiedSkills) {
  const certifiedSkillsByTube = _.groupBy(certifiedSkills, 'tubeId');
  const tubes = await tubeRepository.findByRecordIds(Object.keys(certifiedSkillsByTube), FRENCH_SPOKEN);
  return tubes.map((tube) => {
    const name = tube.practicalTitle;
    return new CertifiedTube({
      id: tube.id,
      name,
      competenceId: tube.competenceId,
    });
  });
}

async function _createCertifiedCompetences(certifiedTubes) {
  const certifiedTubesByCompetence = _.groupBy(certifiedTubes, 'competenceId');
  const competences = await competenceRepository.findByRecordIds({
    competenceIds: Object.keys(certifiedTubesByCompetence),
    locale: FRENCH_SPOKEN,
  });
  return competences.map((competence) => {
    const name = competence.name;
    return new CertifiedCompetence({
      id: competence.id,
      name,
      areaId: competence.areaId,
      origin: competence.origin,
    });
  });
}

async function _createCertifiedAreas(certifiedCompetences) {
  const certifiedCompetencesByArea = _.groupBy(certifiedCompetences, 'areaId');
  const areas = await areaRepository.findByRecordIds({
    areaIds: Object.keys(certifiedCompetencesByArea),
    locale: FRENCH_SPOKEN,
  });
  return areas.map((area) => {
    const name = area.title;
    return new CertifiedArea({
      id: area.id,
      name,
      color: area.color,
    });
  });
}
