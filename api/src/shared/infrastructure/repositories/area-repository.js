import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';
import { Area } from '../../domain/models/Area.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import * as competenceRepository from './competence-repository.js';

const TABLE_NAME = 'learningcontent.areas';

function toDomain(areaDto, locale) {
  const translatedTitle = getTranslatedKey(areaDto.title_i18n, locale);
  return new Area({
    id: areaDto.id,
    code: areaDto.code,
    name: areaDto.name,
    title: translatedTitle,
    color: areaDto.color,
    frameworkId: areaDto.frameworkId,
  });
}

async function list({ locale } = {}) {
  const knex = DomainTransaction.getConnection();
  const areaDtos = await knex.select('*').from(TABLE_NAME).orderBy('name');
  return areaDtos.map((areaDto) => toDomain(areaDto, locale));
}

async function listWithPixCompetencesOnly({ locale } = {}) {
  const areas = await list({ locale });
  const competences = await competenceRepository.listPixCompetencesOnly({ locale });
  areas.forEach((area) => {
    area.competences = competences.filter((competence) => competence.areaId === area.id);
  });
  return areas.filter((area) => area.competences?.length);
}

async function findByFrameworkIdWithCompetences({ frameworkId, locale }) {
  const knex = DomainTransaction.getConnection();
  const areaDtos = await knex.select('*').from(TABLE_NAME).where('frameworkId', frameworkId).orderBy('name');
  const areas = areaDtos.map((areaDto) => toDomain(areaDto, locale));
  const competences = await competenceRepository.list({ locale });
  areas.forEach((area) => {
    area.competences = competences.filter((competence) => competence.areaId === area.id);
  });
  return areas;
}

async function findByFrameworkId({ frameworkId, locale }) {
  const knex = DomainTransaction.getConnection();
  const areaDtos = await knex.select('*').from(TABLE_NAME).where('frameworkId', frameworkId).orderBy('name');
  return areaDtos.map((areaDto) => toDomain(areaDto, locale));
}

async function findByRecordIds({ areaIds, locale }) {
  const knex = DomainTransaction.getConnection();
  const areaDtos = await knex.select('*').from(TABLE_NAME).whereIn('id', areaIds).orderBy('name');
  return areaDtos.map((areaDto) => toDomain(areaDto, locale));
}

async function getAreaCodeByCompetenceId(competenceId) {
  const knex = DomainTransaction.getConnection();
  const areaDtos = await knex.select('*').from(TABLE_NAME);
  const areaDtosForCompetence = areaDtos.filter((areaDto) => areaDto.competenceIds?.includes(competenceId));
  return areaDtosForCompetence?.[0].code;
}

async function get({ id, locale }) {
  const knex = DomainTransaction.getConnection();
  const areaDto = await knex.select('*').from(TABLE_NAME).where('id', id).first();
  if (!areaDto) {
    throw new NotFoundError(`Area "${id}" not found.`);
  }
  return toDomain(areaDto, locale);
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
