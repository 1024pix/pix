import { LOCALE, PIX_ORIGIN } from '../../domain/constants.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';
import { Competence } from '../../domain/models/Competence.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';

const { FRENCH_FRANCE } = LOCALE;
const TABLE_NAME = 'learningcontent.competences';

export async function list({ locale } = { locale: FRENCH_FRANCE }) {
  const knex = DomainTransaction.getConnection();
  const competenceDatas = await knex.select('*').from(TABLE_NAME).orderBy('index');
  return competenceDatas.map((competenceData) => toDomain({ competenceData, locale }));
}

export async function listPixCompetencesOnly({ locale } = { locale: FRENCH_FRANCE }) {
  const knex = DomainTransaction.getConnection();
  const competenceDatas = await knex.select('*').from(TABLE_NAME).where('origin', PIX_ORIGIN).orderBy('index');
  return competenceDatas.map((competenceData) => toDomain({ competenceData, locale }));
}

export async function get({ id, locale }) {
  const knex = DomainTransaction.getConnection();
  const competenceData = await knex.select('*').from(TABLE_NAME).where('id', id).first();
  if (!competenceData) {
    throw new NotFoundError('La compétence demandée n’existe pas');
  }
  return toDomain({ competenceData, locale });
}

export async function getCompetenceName({ id, locale }) {
  const competence = await get({ id, locale });
  return competence.name;
}

export async function findByRecordIds({ competenceIds, locale }) {
  const knex = DomainTransaction.getConnection();
  const competenceDatas = await knex.select('*').from(TABLE_NAME).whereIn('id', competenceIds).orderBy('index');
  return competenceDatas.map((competenceData) => toDomain({ competenceData, locale }));
}

export async function findByAreaId({ areaId, locale }) {
  const knex = DomainTransaction.getConnection();
  const competenceDatas = await knex.select('*').from(TABLE_NAME).where('areaId', areaId).orderBy('index');
  return competenceDatas.map((competenceData) => toDomain({ competenceData, locale }));
}

function toDomain({ competenceData, locale }) {
  const translatedCompetenceName = getTranslatedKey(competenceData.name_i18n, locale);
  const translatedCompetenceDescription = getTranslatedKey(competenceData.description_i18n, locale);

  return new Competence({
    id: competenceData.id,
    name: translatedCompetenceName,
    index: competenceData.index,
    description: translatedCompetenceDescription,
    origin: competenceData.origin,
    skillIds: competenceData.skillIds,
    thematicIds: competenceData.thematicIds,
    areaId: competenceData.areaId,
  });
}
