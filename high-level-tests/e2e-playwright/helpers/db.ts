import Knex from 'knex';

// @ts-expect-error Get database-builder from API project
import { DatabaseBuilder } from '../../../api/db/database-builder/database-builder.js';
import {
  PIX_APP_USER_DATA,
  PIX_ORGA_PRO_DATA,
  PIX_ORGA_SCO_ISMANAGING_DATA,
  PIX_ORGA_SUP_ISMANAGING_DATA,
} from './db-data.js';

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
  // PIX-APP
  databaseBuilder.factory.buildUser.withRawPassword({
    ...PIX_APP_USER_DATA,
    cgu: withCguAccepted,
  });

  // PIX-ORGA
  const legalDocumentVersionId = databaseBuilder.factory.buildLegalDocumentVersion({
    type: 'TOS',
    service: 'pix-orga',
    versionAt: '2020-01-01',
  }).id;
  for (const data of [PIX_ORGA_PRO_DATA, PIX_ORGA_SCO_ISMANAGING_DATA, PIX_ORGA_SUP_ISMANAGING_DATA]) {
    databaseBuilder.factory.buildOrganization(data.organization);
    databaseBuilder.factory.buildUser.withMembership({
      ...data,
      organizationId: data.organization.id,
    });
    if (withCguAccepted) {
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        legalDocumentVersionId,
        userId: data.id,
      });
    }
  }

  await databaseBuilder.commit();
}
