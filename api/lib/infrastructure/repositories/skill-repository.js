import { NotFoundError } from '../../domain/errors';
import Skill from '../../domain/models/Skill';
import skillDatasource from '../datasources/learning-content/skill-datasource';

function _toDomain(skillData) {
  return new Skill({
    id: skillData.id,
    name: skillData.name,
    pixValue: skillData.pixValue,
    competenceId: skillData.competenceId,
    tutorialIds: skillData.tutorialIds,
    tubeId: skillData.tubeId,
    version: skillData.version,
    difficulty: skillData.level,
    learningMoreTutorialIds: skillData.learningMoreTutorialIds,
  });
}

export default {
  async get(id) {
    try {
      return _toDomain(await skillDatasource.get(id));
    } catch (e) {
      throw new NotFoundError('Erreur, compétence introuvable');
    }
  },

  async list() {
    const skillDatas = await skillDatasource.list();
    return skillDatas.map(_toDomain);
  },

  async findActiveByTubeId(tubeId) {
    const skillDatas = await skillDatasource.findActiveByTubeId(tubeId);
    return skillDatas.map(_toDomain);
  },

  async findOperativeByTubeId(tubeId) {
    const skillDatas = await skillDatasource.findOperativeByTubeId(tubeId);
    return skillDatas.map(_toDomain);
  },

  async findActiveByCompetenceId(competenceId) {
    const skillDatas = await skillDatasource.findActiveByCompetenceId(competenceId);
    return skillDatas.map(_toDomain);
  },

  async findOperativeByCompetenceId(competenceId) {
    const skillDatas = await skillDatasource.findOperativeByCompetenceId(competenceId);
    return skillDatas.map(_toDomain);
  },

  async findOperativeByCompetenceIds(competenceIds) {
    const skillDatas = await skillDatasource.findOperativeByCompetenceIds(competenceIds);
    return skillDatas.map(_toDomain);
  },

  async findOperativeByIds(skillIds) {
    const skillDatas = await skillDatasource.findOperativeByRecordIds(skillIds);
    return skillDatas.map(_toDomain);
  },

  async findByRecordIds(skillIds) {
    const skillDatas = await skillDatasource.findByRecordIds(skillIds);
    return skillDatas.map(_toDomain);
  },
};
