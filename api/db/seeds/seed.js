'use strict';
const DatabaseBuilder = require('../../tests/tooling/database-builder/database-builder');
const assessmentsBuilder = require('./data/assessments-builder');
const assessmentResultsBuilder = require('./data/assessment-results-builder');
const campaignParticipationsBuilder = require('./data/campaign-participations-builder');
const campaignsBuilder = require('./data/campaigns-builder');
const certificationCentersBuilder = require('./data/certification-centers-builder');
const certificationCenterMembershipsBuilder = require('./data/certification-center-memberships-builder');
const certificationChallengesBuilder = require('./data/certification-challenges-builder');
const certificationCoursesBuilder = require('./data/certification-courses-builder');
const competenceMarksBuilder = require('./data/competence-marks-builder');
const dragonAndCoBuilder = require('./data/dragon-and-co-builder');
const organizationsBuilder = require('./data/organizations-builder');
const pixAileBuilder = require('./data/pix-aile-builder');
const sessionsBuilder = require('./data/sessions-builder');
const usersBuilder = require('./data/users-builder');
const usersPixRolesBuilder = require('./data/users_pix_roles-builder');

const SEQUENCE_RESTART_AT_NUMBER = 10000000;

// Tables must be inserted in a specific orderr
const orderedTableNames = [
  'answers',
  'snapshots',
];

// Some seed datas are wrapped into promises, hence the need for #Promise.all
async function insertSeeds(knex, orderedTableNames) {
  for (const tableName of orderedTableNames) {
    const seedData = await Promise.all(require('./data/' + tableName + '.js'));
    await insertSeedByData(knex, tableName, seedData);
  }
}

async function insertSeedByData(knex, tableName, tableRows) {
  for (const row of tableRows) {
    await knex(tableName).insert(row).catch(console.log);
  }
}

exports.seed = (knex) => {

  const databaseBuilder = new DatabaseBuilder({ knex });

  usersBuilder({ databaseBuilder });
  usersPixRolesBuilder({ databaseBuilder });
  pixAileBuilder({ databaseBuilder });
  dragonAndCoBuilder({ databaseBuilder });
  organizationsBuilder({ databaseBuilder });
  campaignsBuilder({ databaseBuilder });
  campaignParticipationsBuilder({ databaseBuilder });
  certificationCentersBuilder({ databaseBuilder });
  certificationCenterMembershipsBuilder({ databaseBuilder });
  sessionsBuilder({ databaseBuilder });
  certificationCoursesBuilder({ databaseBuilder });
  certificationChallengesBuilder({ databaseBuilder });
  assessmentsBuilder({ databaseBuilder });
  assessmentResultsBuilder({ databaseBuilder });
  competenceMarksBuilder({ databaseBuilder });

  return databaseBuilder.commit()
    .then(() => insertSeeds(knex, orderedTableNames))
    .then(() => alterSequenceIfPG(knex));
};

/**
 * Inserting elements in PGSQL when specifying their ID does not update the sequence for that id.
 * THis results in id conflict errors when trying to insert a new elements in the base.
 * Making the sequences start at an arbitrary high number prevents the problem from happening for a time.
 * (time being enough for dev ou review apps - seed are not run on staging or prod)
 */
function alterSequenceIfPG(knex) {

  const isPG = process.env.DATABASE_URL || false;

  if (isPG) {
    return knex.raw('SELECT sequence_name FROM information_schema.sequences;')
      .then((sequenceNameQueryResult) => {
        const sequenceNames = sequenceNameQueryResult.rows.map((row) => row.sequence_name);

        const sequenceUpdatePromises = sequenceNames.map((sequenceName) => {
          return knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${SEQUENCE_RESTART_AT_NUMBER};`);
        });
        return Promise.all(sequenceUpdatePromises);
      });
  }
}
