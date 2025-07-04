import Knex from 'knex';

// @ts-expect-error Get database-builder from API project
import { DatabaseBuilder } from '../../../api/db/database-builder/database-builder.js';
import { PIX_APP_USER_DATA, PIX_ORGA_PRO_DATA } from './db-data.js';

const knex = Knex({ client: 'postgresql', connection: process.env.DATABASE_URL });

export const databaseBuilder = await DatabaseBuilder.create({ knex, emptyFirst: false });

export async function cleanDB() {
  await databaseBuilder.emptyDatabase({ keepLearningContent: true });
  // Reset assessment id sequence for smart random to be predictable
  const result = await databaseBuilder.knex.raw(`SELECT pg_get_serial_sequence(?, ?) AS sequence_name`, [
    'assessments',
    'id',
  ]);
  const sequenceName = result.rows[0]?.sequence_name;
  await databaseBuilder.knex.raw(`SELECT setval(?, 1, false)`, [sequenceName]);
}

export async function buildAuthenticatedUsers({ withCguAccepted }: { withCguAccepted: boolean }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    ...PIX_APP_USER_DATA,
    cgu: withCguAccepted,
  });

  databaseBuilder.factory.buildOrganization({
    id: PIX_ORGA_PRO_DATA.organizationId,
    type: PIX_ORGA_PRO_DATA.type,
  });
  databaseBuilder.factory.buildUser.withMembership(PIX_ORGA_PRO_DATA);
  const legalDocumentVersionId = databaseBuilder.factory.buildLegalDocumentVersion({
    type: 'TOS',
    service: 'pix-orga',
    versionAt: '2020-01-01',
  }).id;
  if (withCguAccepted) {
    databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
      legalDocumentVersionId,
      userId: PIX_ORGA_PRO_DATA.id,
    });
  }
  await databaseBuilder.commit();
}
