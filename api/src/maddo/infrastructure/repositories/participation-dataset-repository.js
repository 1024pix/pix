import { knex as datamartKnex } from '../../../../datamart/knex-database-connection.js';
import { ParticipationDataset } from '../../domain/models/men/dashboard/ParticipationDataset.js';

const TABLE_NAME = 'men_dashboard_participation_dataset';
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;

export async function findAll({ page = {} } = {}) {
  const number = page.number ?? DEFAULT_PAGE_NUMBER;
  const size = page.size ?? DEFAULT_PAGE_SIZE;
  const offset = (number - 1) * size;

  const [rows, countResult] = await Promise.all([
    datamartKnex(TABLE_NAME)
      .orderBy(['academieName', 'provinceCode', 'schoolUai', 'schoolYearGroup', 'competenceCode'])
      .limit(size)
      .offset(offset),
    datamartKnex(TABLE_NAME).count('* as rowCount').first(),
  ]);

  const rowCount = parseInt(countResult.rowCount, 10);

  return {
    models: rows.map((row) => new ParticipationDataset(row)),
    meta: {
      page: number,
      pageSize: size,
      pageCount: Math.ceil(rowCount / size),
    },
  };
}
