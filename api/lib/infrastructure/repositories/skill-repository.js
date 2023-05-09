import { NotFoundError } from '../../domain/errors.js';
import { Skill } from '../../domain/models/Skill.js';
import { skillDatasource } from '../datasources/learning-content/skill-datasource.js';

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

const get = async function (id) {
  try {
    return _toDomain(await skillDatasource.get(id));
  } catch (e) {
    throw new NotFoundError('Erreur, compétence introuvable');
  }
};

const list = async function () {
  const skillDatas = await skillDatasource.list();
  return skillDatas.map(_toDomain);
};

const findActiveByTubeId = async function (tubeId) {
  const skillDatas = await skillDatasource.findActiveByTubeId(tubeId);
  return skillDatas.map(_toDomain);
};

const findOperativeByTubeId = async function (tubeId) {
  const skillDatas = await skillDatasource.findOperativeByTubeId(tubeId);
  return skillDatas.map(_toDomain);
};

const findActiveByCompetenceId = async function (competenceId) {
  const skillDatas = await skillDatasource.findActiveByCompetenceId(competenceId);
  return skillDatas.map(_toDomain);
};

const findOperativeByCompetenceId = async function (competenceId) {
  const skillDatas = await skillDatasource.findOperativeByCompetenceId(competenceId);
  return skillDatas.map(_toDomain);
};

const findOperativeByCompetenceIds = async function (competenceIds) {
  const skillDatas = await skillDatasource.findOperativeByCompetenceIds(competenceIds);
  return skillDatas.map(_toDomain);
};

const findOperativeByIds = async function (skillIds) {
  const skillDatas = await skillDatasource.findOperativeByRecordIds(skillIds);
  return skillDatas.map(_toDomain);
};

const findByRecordIds = async function (skillIds) {
  const skillDatas = await skillDatasource.findByRecordIds(skillIds);
  return skillDatas.map(_toDomain);
};

export {
  get,
  list,
  findActiveByTubeId,
  findOperativeByTubeId,
  findActiveByCompetenceId,
  findOperativeByCompetenceId,
  findOperativeByCompetenceIds,
  findOperativeByIds,
  findByRecordIds,
};
