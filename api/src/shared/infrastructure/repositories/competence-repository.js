import _ from 'lodash';
import { LearningContentResourceNotFound } from '../datasources/learning-content/LearningContentResourceNotFound.js';
import { Competence } from '../../domain/models/Competence.js';
import { competenceDatasource } from '../../../../lib/infrastructure/datasources/learning-content/competence-datasource.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { PIX_ORIGIN } from '../../../../lib/domain/constants.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { FRENCH_FRANCE } = LOCALE;

import { getTranslatedKey } from '../../../../lib/domain/services/get-translated-text.js';

function _toDomain({ competenceData, locale }) {
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

const list = function ({ locale } = { locale: FRENCH_FRANCE }) {
  return _list({ locale: locale || FRENCH_FRANCE });
};

const listPixCompetencesOnly = async function ({ locale } = { locale: FRENCH_FRANCE }) {
  const allCompetences = await _list({ locale });
  return allCompetences.filter((competence) => competence.origin === PIX_ORIGIN);
};

const get = async function ({ id, locale }) {
  try {
    const competenceData = await competenceDatasource.get(id);
    return _toDomain({ competenceData, locale });
  } catch (err) {
    if (err instanceof LearningContentResourceNotFound) {
      throw new NotFoundError('La compétence demandée n’existe pas');
    }
    throw err;
  }
};

const getCompetenceName = async function ({ id, locale }) {
  try {
    const competence = await competenceDatasource.get(id);
    return getTranslatedKey(competence.name_i18n, locale);
  } catch (err) {
    if (err instanceof LearningContentResourceNotFound) {
      throw new NotFoundError('La compétence demandée n’existe pas');
    }
    throw err;
  }
};

const findByRecordIds = async function ({ competenceIds, locale }) {
  const competenceDatas = await competenceDatasource.list();
  return competenceDatas
    .filter(({ id }) => competenceIds.includes(id))
    .map((competenceData) => _toDomain({ competenceData, locale }));
};

const findByAreaId = async function ({ areaId, locale }) {
  const competenceDatas = await competenceDatasource.list();
  return competenceDatas
    .filter((competenceData) => competenceData.areaId === areaId)
    .map((competenceData) => _toDomain({ competenceData, locale }));
};

export { list, listPixCompetencesOnly, get, getCompetenceName, findByRecordIds, findByAreaId };

async function _list({ locale }) {
  const competenceDatas = await competenceDatasource.list();
  return _.sortBy(
    competenceDatas.map((competenceData) => _toDomain({ competenceData, locale })),
    'index',
  );
}
