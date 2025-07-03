import Knex from 'knex';

// @ts-expect-error Get database-builder from API project
import { DatabaseBuilder } from '../../../api/db/database-builder/database-builder.js';
import { LOGGED_APP_USER_ID, LOGGED_ORGA_USER_ID } from './auth.js';
import { DEMO_COURSE_ID, NB_CHALLENGES_IN_DEMO_COURSE, SEED_FOR_RANDOM_DATABASE } from './constants.js';

const knex = Knex({ client: 'postgresql', connection: process.env.DATABASE_URL });

export const databaseBuilder = await DatabaseBuilder.create({ knex, emptyFirst: false });

export async function cleanDB() {
  await databaseBuilder.emptyDatabase({ keepLearningContent: true });
  const result = await databaseBuilder.knex.raw(`SELECT pg_get_serial_sequence(?, ?) AS sequence_name`, [
    'assessments',
    'id',
  ]);
  const sequenceName = result.rows[0]?.sequence_name;
  await databaseBuilder.knex.raw(`SELECT setval(?, 1, false)`, [sequenceName]);
}

export async function commonSeeds() {
  databaseBuilder.factory.buildUser.withRawPassword({ id: LOGGED_APP_USER_ID, cgu: true });
  const organizationId = databaseBuilder.factory.buildOrganization({
    type: 'PRO',
  }).id;
  databaseBuilder.factory.buildUser.withMembership({ id: LOGGED_ORGA_USER_ID, organizationId });
  databaseBuilder.factory.buildLegalDocumentVersion({
    id: 123456,
    type: 'TOS',
    service: 'pix-orga',
    versionAt: '2020-01-01',
  });
  databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
    legalDocumentVersionId: 123456,
    userId: LOGGED_ORGA_USER_ID,
  });
  const targetProfileId = databaseBuilder.factory.buildTargetProfile({
    name: 'PC PLAYWRIGHT',
    ownerOrganizationId: organizationId,
    isSimplifiedAccess: false,
    description: 'PC pour Playwright',
    comment: null,
    imageUrl: null,
    outdated: false,
    areKnowledgeElementsResettable: false,
  }).id;
  const tubeIds = await databaseBuilder
    .knex('learningcontent.tubes')
    .pluck('learningcontent.tubes.id')
    .join('learningcontent.competences', 'learningcontent.tubes.competenceId', 'learningcontent.competences.id')
    .where('learningcontent.competences.origin', '=', 'Pix')
    .orderBy('learningcontent.tubes.id');
  for (const tubeId of tubeIds) {
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId,
      tubeId,
      level: 2,
    });
  }

  const exists = await knex('learningcontent.courses').where({ id: DEMO_COURSE_ID }).first();
  if (!exists) {
    await databaseBuilder.knex.raw('SELECT setseed(?)', [SEED_FOR_RANDOM_DATABASE]);
    const challengeIds = await databaseBuilder
      .knex('learningcontent.challenges')
      .pluck('id')
      .where('status', '=', 'validé')
      .whereRaw('? = ANY(locales)', ['fr'])
      .orderByRaw('random()')
      .limit(NB_CHALLENGES_IN_DEMO_COURSE);
    databaseBuilder.factory.learningContent.buildCourse({
      id: DEMO_COURSE_ID,
      name: 'Test démo Playwright',
      description: 'un test de démo pour Playwright',
      isActive: true,
      competences: [],
      challenges: challengeIds,
    });
  }
  await databaseBuilder.commit();
}
