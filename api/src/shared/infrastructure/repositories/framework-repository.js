import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { Framework } from '../../domain/models/Framework.js';
import { child, SCOPES } from '../utils/logger.js';

const TABLE_NAME = 'learningcontent.frameworks';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export async function getByName(name) {
  const frameworkDto = await knex.select('*').from(TABLE_NAME).where('name', name).first();
  if (!frameworkDto) {
    logger.warn({ frameworkName: name }, 'Référentiel introuvable');
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return toDomain(frameworkDto);
}

export async function findByRecordIds(ids) {
  const frameworkDtos = await knex.select('*').from(TABLE_NAME).whereIn('id', ids).orderBy('name');
  return frameworkDtos.map(toDomain);
}

function toDomain(frameworkData) {
  return new Framework({
    id: frameworkData.id,
    name: frameworkData.name,
    areas: [],
  });
}
