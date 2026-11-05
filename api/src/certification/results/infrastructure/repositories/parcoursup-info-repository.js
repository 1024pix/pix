import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { Info } from '../../domain/read-models/parcoursup/Info.ts';

export async function get() {
  const infoData = await datamartKnex
    .select({
      replicationName: 'replication_name',
      lastUpdatedAt: 'last_updated_at',
    })
    .from('replication_metadata')
    .whereIn('replication_name', ['certification_results', 'sco_certification_results'])
    .orderBy('replication_name');

  const now = new Date();
  const lastUpdatedAtCurrentSchoolYear =
    infoData.find(({ replicationName }) => replicationName === 'sco_certification_results')?.lastUpdatedAt ?? null;
  const lastUpdatedAtVerificationCode =
    infoData.find(({ replicationName }) => replicationName === 'certification_results')?.lastUpdatedAt ?? null;

  return new Info({ sentAt: now, lastUpdatedAtCurrentSchoolYear, lastUpdatedAtVerificationCode });
}
