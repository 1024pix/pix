import { knex } from '../../../../db/knex-database-connection.js';
import { Framework } from '../../domain/models/Framework.js';
const TABLE_NAME = 'learningcontent.frameworks';

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
