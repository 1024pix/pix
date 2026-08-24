import { knex as datamartKnex } from '../../../../datamart/knex-database-connection.js';
import { CertificationDataset } from '../../domain/models/men/dashboard/CertificationDataset.js';

const TABLE_NAME = 'men_dashboard_certification_dataset';
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;

export async function findAll({ page = {} } = {}) {
  const number = page.number ?? DEFAULT_PAGE_NUMBER;
  const size = page.size ?? DEFAULT_PAGE_SIZE;
  const offset = (number - 1) * size;

  const rows = await datamartKnex(TABLE_NAME)
    .orderBy(['academieName', 'provinceCode', 'schoolUai', 'schoolYearGroup', 'competenceCode'])
    .limit(size)
    .offset(offset);
  const countResult = await datamartKnex(TABLE_NAME).count('* as rowCount').first();

  const rowCount = parseInt(countResult.rowCount, 10);

  return {
    models: rows.map((row) => new CertificationDataset(row)),
    meta: {
      page: number,
      pageSize: size,
      pageCount: Math.ceil(rowCount / size),
    },
  };
}
