import _ from 'lodash';

import { Area } from '../../../../lib/domain/models/Area.js';
import { NotFoundError } from '../../domain/errors.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import { areaDatasource } from '../../infrastructure/datasources/learning-content/area-datasource.js';
import * as competenceRepository from './competence-repository.js';

function _toDomain({ areaData, locale }) {
  const translatedTitle = getTranslatedKey(areaData.title_i18n, locale);
  return new Area({
    id: areaData.id,
    code: areaData.code,
    name: areaData.name,
    title: translatedTitle,
    color: areaData.color,
    frameworkId: areaData.frameworkId,
  });
}

async function list({ locale } = {}) {
  const areaDataObjects = await areaDatasource.list();
  return areaDataObjects.map((areaData) => _toDomain({ areaData, locale }));
}

async function listWithPixCompetencesOnly({ locale } = {}) {
  const [areas, competences] = await Promise.all([
    list({ locale }),
    competenceRepository.listPixCompetencesOnly({ locale }),
  ]);
  areas.forEach((area) => {
    area.competences = _.filter(competences, { areaId: area.id });
  });
  return _.filter(areas, ({ competences }) => !_.isEmpty(competences));
}

async function findByFrameworkIdWithCompetences({ frameworkId, locale }) {
  const areaDatas = await areaDatasource.findByFrameworkId(frameworkId);
  const areas = areaDatas.map((areaData) => _toDomain({ areaData, locale }));
  const competences = await competenceRepository.list({ locale });
  areas.forEach((area) => {
    area.competences = _.filter(competences, { areaId: area.id });
  });
  return areas;
}

async function findByFrameworkId({ frameworkId, locale }) {
  const areaDatas = await areaDatasource.findByFrameworkId(frameworkId);
  return areaDatas.map((areaData) => _toDomain({ areaData, locale }));
}

async function findByRecordIds({ areaIds, locale }) {
  const areaDataObjects = await areaDatasource.list();
  return areaDataObjects.filter(({ id }) => areaIds.includes(id)).map((areaData) => _toDomain({ areaData, locale }));
}

async function getAreaCodeByCompetenceId(competenceId) {
  const area = await areaDatasource.findOneFromCompetenceId(competenceId);
  return area.code;
}

async function get({ id, locale }) {
  const areaDataObjects = await areaDatasource.list();
  const areaData = areaDataObjects.find((area) => area.id === id);
  if (!areaData) {
    throw new NotFoundError(`Area "${id}" not found.`);
  }
  return _toDomain({ areaData, locale });
}

export {
  findByFrameworkId,
  findByFrameworkIdWithCompetences,
  findByRecordIds,
  get,
  getAreaCodeByCompetenceId,
  list,
  listWithPixCompetencesOnly,
};
